import { useEffect, useId, useRef, useState } from 'react';
import { useSoundPreference } from '../context/SoundPreferenceContext';
import type { Todo } from '../types';
import { playCompletionSound, playButtonSound } from '../utils/sounds';
import { Button } from './ui/Button';
import { EditIcon, TrashIcon } from './ui/Icons';

interface TodoItemCardProps {
  todo: Todo;
  isLast?: boolean;
  onToggle: (todo: Todo) => Promise<void>;
  onEdit: (todo: Todo) => void;
  onDelete: (todo: Todo) => Promise<void>;
}

function formatDueDate(value: string | null) {
  if (!value) {
    return null;
  }

  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function TodoItemCard({
  todo,
  isLast = false,
  onToggle,
  onEdit,
  onDelete,
}: TodoItemCardProps) {
  const checkboxId = useId();
  const { soundsEnabled } = useSoundPreference();
  const [isBusy, setIsBusy] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const wasCompletedRef = useRef(todo.isCompleted);

  useEffect(() => {
    if (!wasCompletedRef.current && todo.isCompleted) {
      setIsCompleting(true);

      const timer = window.setTimeout(() => setIsCompleting(false), 500);
      wasCompletedRef.current = todo.isCompleted;
      return () => window.clearTimeout(timer);
    }

    wasCompletedRef.current = todo.isCompleted;
  }, [todo.isCompleted]);

  async function handleToggle() {
    const willComplete = !todo.isCompleted;

    if (soundsEnabled) {
      if (willComplete) {
        playCompletionSound();
      } else {
        playButtonSound();
      }
    }

    setIsBusy(true);
    try {
      await onToggle(todo);
    } finally {
      setIsBusy(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this task?')) {
      return;
    }

    setIsBusy(true);
    try {
      await onDelete(todo);
    } finally {
      setIsBusy(false);
    }
  }

  const dueDateLabel = formatDueDate(todo.dueDate);

  return (
    <article
      data-todo-id={todo.id}
      className={[
        'group relative px-5 py-4 transition-colors duration-300 sm:px-6 sm:py-5',
        !isLast ? 'border-b border-white/50' : '',
        todo.isCompleted ? 'bg-white/25' : 'hover:bg-white/35',
        isCompleting ? 'todo-row-complete' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex items-start gap-4">
        <label
          htmlFor={checkboxId}
          className="relative mt-0.5 flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center"
        >
          <input
            id={checkboxId}
            type="checkbox"
            checked={todo.isCompleted}
            onChange={handleToggle}
            disabled={isBusy}
            className="peer sr-only"
          />
          <span
            className={[
              'flex h-8 w-8 items-center justify-center rounded-full border-0 text-sm font-bold transition-all duration-200',
              'shadow-clay-button peer-checked:bg-gradient-to-br peer-checked:from-emerald-400 peer-checked:to-emerald-600 peer-checked:text-white',
              'peer-focus-visible:ring-4 peer-focus-visible:ring-clay-accent/30',
              'peer-active:scale-[0.92] peer-active:shadow-clay-pressed',
              todo.isCompleted
                ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white'
                : 'bg-white text-transparent',
              isCompleting ? 'todo-check-pop' : '',
            ].join(' ')}
            aria-hidden="true"
          >
            ✓
          </span>
        </label>

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-3">
            <label
              htmlFor={checkboxId}
              className="min-w-0 flex-1 cursor-pointer"
            >
              <h3
                className={[
                  'font-nunito m-0 text-xl font-bold leading-snug tracking-tight transition-all duration-300',
                  todo.isCompleted
                    ? 'text-clay-muted line-through decoration-2 decoration-clay-muted/60'
                    : 'text-clay-foreground',
                  isCompleting ? 'todo-title-complete' : '',
                ].join(' ')}
              >
                {todo.title}
              </h3>
            </label>

            <div className="flex shrink-0 gap-2 opacity-100 transition-opacity duration-200 sm:opacity-70 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onEdit(todo)}
                disabled={isBusy}
                aria-label={`Edit "${todo.title}"`}
                className="!h-11 !w-11 !min-w-0 !px-0"
              >
                <EditIcon />
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
                disabled={isBusy}
                aria-label={`Delete "${todo.title}"`}
                className="!h-11 !w-11 !min-w-0 !px-0"
              >
                <TrashIcon />
              </Button>
            </div>
          </div>

          {todo.description && (
            <label
              htmlFor={checkboxId}
              className="mt-2 block cursor-pointer"
            >
              <p
                className={[
                  'm-0 text-base font-medium leading-relaxed transition-all duration-300',
                  todo.isCompleted
                    ? 'text-clay-muted/80 line-through decoration-clay-muted/40'
                    : 'text-clay-muted',
                ].join(' ')}
              >
                {todo.description}
              </p>
            </label>
          )}

          {dueDateLabel && (
            <span
              className={[
                'mt-3 inline-flex items-center rounded-full px-4 py-1.5 text-sm font-bold tracking-wide transition-colors duration-300',
                todo.isCompleted
                  ? 'bg-white/50 text-clay-muted'
                  : 'bg-clay-accent/10 text-clay-accent',
              ].join(' ')}
            >
              Due {dueDateLabel}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
