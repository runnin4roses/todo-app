import { useCallback, useEffect, useMemo, useState } from 'react';
import { ApiError, api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useButtonClickSound } from '../hooks/useButtonClickSound';
import type { Todo, TodoFilter } from '../types';
import {
  buildTaskSummary,
  getDisplayName,
  getTimeGreeting,
} from '../utils/greeting';
import { sortTodos, useTodoListFlip } from '../utils/sortTodos';
import { getDueDateUrgency } from '../utils/dueDate';
import { ErrorBanner } from './ErrorBanner';
import { DueDateLegend } from './DueDateLegend';
import { Modal } from './Modal';
import { TodoForm } from './TodoForm';
import { TodoItemCard } from './TodoItemCard';
import { UserBar } from './UserBar';
import { Button } from './ui/Button';
import { PlusIcon, EditIcon } from './ui/Icons';

export function TodoApp() {
  const { token, email } = useAuth();
  const { withClickSound } = useButtonClickSound();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<TodoFilter>('all');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  const loadTodos = useCallback(async () => {
    if (!token) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await api.getTodos(token);
      setTodos(sortTodos(data));
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Unable to load tasks. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadTodos();
  }, [loadTodos]);

  async function handleCreate(values: {
    title: string;
    description: string;
    dueDate: string;
  }) {
    if (!token) {
      return;
    }

    await api.createTodo(token, {
      title: values.title.trim(),
      description: values.description.trim() || undefined,
      dueDate: values.dueDate || undefined,
    });
    await loadTodos();
    setIsAddModalOpen(false);
  }

  async function handleUpdate(
    todo: Todo,
    values: { title: string; description: string; dueDate: string }
  ) {
    if (!token) {
      return;
    }

    const patch: {
      title: string;
      description?: string;
      dueDate?: string;
      clearDueDate?: boolean;
    } = {
      title: values.title.trim(),
      description: values.description.trim() || undefined,
    };

    if (values.dueDate) {
      patch.dueDate = values.dueDate;
    } else if (todo.dueDate) {
      patch.clearDueDate = true;
    }

    await api.patchTodo(token, todo.id, patch);
    await loadTodos();
    setEditingTodo(null);
  }

  async function handleToggle(todo: Todo) {
    if (!token) {
      return;
    }

    const previousTodos = todos;

    setTodos((current) =>
      sortTodos(
        current.map((item) =>
          item.id === todo.id
            ? { ...item, isCompleted: !item.isCompleted }
            : item
        )
      )
    );

    try {
      await api.patchTodo(token, todo.id, {
        isCompleted: !todo.isCompleted,
      });
    } catch (err) {
      setTodos(previousTodos);
      const message =
        err instanceof ApiError
          ? err.message
          : 'Unable to update task. Please try again.';
      setError(message);
    }
  }

  async function handleDelete(todo: Todo) {
    if (!token) {
      return;
    }

    try {
      await api.deleteTodo(token, todo.id);
      await loadTodos();
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Unable to delete task. Please try again.';
      setError(message);
    }
  }

  const activeTodos = useMemo(
    () => todos.filter((todo) => !todo.isCompleted),
    [todos]
  );

  const filteredTodos = useMemo(() => {
    let list: Todo[];

    if (filter === 'active') {
      list = todos.filter((todo) => !todo.isCompleted);
    } else if (filter === 'completed') {
      list = todos.filter((todo) => todo.isCompleted);
    } else {
      list = todos;
    }

    return sortTodos(list);
  }, [todos, filter]);

  const listFlipRef = useTodoListFlip(filteredTodos.map((todo) => todo.id));

  const showDueTodayLegend = filteredTodos.some(
    (todo) =>
      !todo.isCompleted &&
      todo.dueDate &&
      getDueDateUrgency(todo.dueDate) === 'today'
  );
  const showDueTomorrowLegend = filteredTodos.some(
    (todo) =>
      !todo.isCompleted &&
      todo.dueDate &&
      getDueDateUrgency(todo.dueDate) === 'tomorrow'
  );
  const showDueThisWeekLegend = filteredTodos.some(
    (todo) =>
      !todo.isCompleted &&
      todo.dueDate &&
      getDueDateUrgency(todo.dueDate) === 'thisWeek'
  );

  const greeting = email ? getTimeGreeting() : '';
  const displayName = email ? getDisplayName(email) : '';
  const taskSummary = buildTaskSummary(activeTodos);

  return (
    <div>
      <UserBar />

      <header className="mb-8 sm:mb-10 md:mb-12">
        <h1 className="font-nunito m-0 text-4xl font-black leading-[1.1] tracking-tight text-clay-foreground sm:text-5xl md:text-6xl">
          {greeting}, {displayName}
        </h1>
        <p className="mt-3 m-0 max-w-2xl text-base font-medium leading-relaxed text-clay-muted sm:text-lg">
          {isLoading ? 'Checking your tasks...' : taskSummary}
        </p>
      </header>

      <ErrorBanner message={error} onDismiss={() => setError(null)} />

      <section>
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <h2 className="font-nunito m-0 text-2xl font-extrabold tracking-tight text-clay-foreground sm:text-3xl">
            Your tasks
          </h2>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <div
              className="flex w-full gap-2 rounded-[20px] bg-[#EFEBF5] p-1.5 shadow-clay-pressed sm:w-auto"
              role="tablist"
              aria-label="Filter tasks"
            >
              {(['all', 'active', 'completed'] as TodoFilter[]).map((value) => (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={filter === value}
                  className={[
                    'flex-1 rounded-[16px] border-0 px-5 py-3 font-nunito text-sm font-bold capitalize tracking-wide transition-all duration-200 sm:flex-initial',
                    filter === value
                      ? 'bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-white shadow-clay-button'
                      : 'bg-transparent text-clay-muted hover:text-clay-foreground',
                  ].join(' ')}
                  onClick={withClickSound(() => setFilter(value))}
                >
                  {value}
                </button>
              ))}
            </div>
            <Button
              onClick={() => {
                setEditingTodo(null);
                setIsAddModalOpen(true);
              }}
              className="w-full gap-2 sm:w-auto"
            >
              <PlusIcon />
              Add task
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <div className="h-12 w-12 animate-clay-breathe rounded-full bg-gradient-to-br from-purple-400 to-purple-600 shadow-clay-button" />
            <p className="m-0 text-base font-medium text-clay-muted">
              Loading tasks...
            </p>
          </div>
        ) : filteredTodos.length === 0 ? (
          <div className="rounded-[32px] bg-clay-card px-6 py-12 text-center shadow-clay-card backdrop-blur-xl">
            <div
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-pink-600 text-3xl text-white shadow-clay-button"
              aria-hidden="true"
            >
              ✦
            </div>
            <p className="font-nunito m-0 text-xl font-bold text-clay-foreground">
              {filter === 'all' ? 'No tasks yet' : `No ${filter} tasks`}
            </p>
            <p className="mt-2 m-0 text-base font-medium leading-relaxed text-clay-muted">
              {filter === 'all'
                ? 'Tap "Add task" to create your first one.'
                : 'Try a different filter to see more tasks.'}
            </p>
          </div>
        ) : (
          <>
            <DueDateLegend
              showToday={showDueTodayLegend}
              showTomorrow={showDueTomorrowLegend}
              showThisWeek={showDueThisWeekLegend}
            />
            <div
              ref={listFlipRef}
              className="overflow-hidden rounded-[32px] bg-[#EFEBF5]/90 shadow-clay-pressed"
            >
            {filteredTodos.map((todo, index) => (
              <TodoItemCard
                key={todo.id}
                todo={todo}
                isLast={index === filteredTodos.length - 1}
                onToggle={handleToggle}
                onEdit={(todo) => {
                  setIsAddModalOpen(false);
                  setEditingTodo(todo);
                }}
                onDelete={handleDelete}
              />
            ))}
            </div>
          </>
        )}
      </section>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add a task"
        description="Capture what you need to get done."
        icon={<PlusIcon className="h-5 w-5" />}
      >
        <TodoForm
          variant="modal"
          submitLabel="Add task"
          onSubmit={handleCreate}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={editingTodo !== null}
        onClose={() => setEditingTodo(null)}
        title="Edit task"
        description="Update the details for this task."
        icon={<EditIcon className="h-5 w-5" />}
      >
        {editingTodo && (
          <TodoForm
            key={editingTodo.id}
            variant="modal"
            initial={editingTodo}
            submitLabel="Save changes"
            onSubmit={(values) => handleUpdate(editingTodo, values)}
            onCancel={() => setEditingTodo(null)}
          />
        )}
      </Modal>
    </div>
  );
}
