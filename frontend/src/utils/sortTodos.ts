import { useLayoutEffect, useRef } from 'react';
import type { Todo } from '../types';
import { compareTodosByDueDate } from './dueDate';

const FLIP_DURATION_MS = 500;
const FLIP_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';

export function sortTodos(todos: Todo[]) {
  return [...todos].sort((a, b) => {
    if (a.isCompleted !== b.isCompleted) {
      return a.isCompleted ? 1 : -1;
    }

    return compareTodosByDueDate(a, b);
  });
}

export function useTodoListFlip(todoIds: number[]) {
  const containerRef = useRef<HTMLDivElement>(null);
  const positionsRef = useRef<Map<number, number>>(new Map());
  const orderKey = todoIds.join(',');

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const items = Array.from(
      container.querySelectorAll<HTMLElement>('[data-todo-id]')
    );

    const nextPositions = new Map<number, number>();
    for (const item of items) {
      const id = Number(item.dataset.todoId);
      nextPositions.set(id, item.offsetTop);
    }

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (!prefersReducedMotion) {
      for (const item of items) {
        const id = Number(item.dataset.todoId);
        const previousTop = positionsRef.current.get(id);
        const nextTop = nextPositions.get(id);

        if (
          previousTop === undefined ||
          nextTop === undefined ||
          previousTop === nextTop
        ) {
          continue;
        }

        const deltaY = previousTop - nextTop;
        item.style.transform = `translateY(${deltaY}px)`;
        item.style.transition = 'transform 0s';
        item.style.zIndex = '1';

        requestAnimationFrame(() => {
          item.style.transition = `transform ${FLIP_DURATION_MS}ms ${FLIP_EASING}`;
          item.style.transform = 'translateY(0)';

          const cleanup = () => {
            item.style.transition = '';
            item.style.transform = '';
            item.style.zIndex = '';
            item.removeEventListener('transitionend', cleanup);
          };

          item.addEventListener('transitionend', cleanup);
        });
      }
    }

    positionsRef.current = nextPositions;
  }, [orderKey]);

  return containerRef;
}
