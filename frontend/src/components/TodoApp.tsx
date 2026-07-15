import { useCallback, useEffect, useState } from 'react';
import { ApiError, api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { Todo, TodoFilter } from '../types';
import { ErrorBanner } from './ErrorBanner';
import { Modal } from './Modal';
import { TodoForm } from './TodoForm';
import { TodoItemCard } from './TodoItemCard';
import { Button } from './ui/Button';

export function TodoApp() {
  const { token, email, logout } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<TodoFilter>('all');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const loadTodos = useCallback(async () => {
    if (!token) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await api.getTodos(token, filter);
      setTodos(data);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Unable to load tasks. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [token, filter]);

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
  }

  async function handleToggle(todo: Todo) {
    if (!token) {
      return;
    }

    await api.patchTodo(token, todo.id, {
      isCompleted: !todo.isCompleted,
    });
    await loadTodos();
  }

  async function handleDelete(todo: Todo) {
    if (!token) {
      return;
    }

    await api.deleteTodo(token, todo.id);
    await loadTodos();
  }

  const activeCount = todos.filter((t) => !t.isCompleted).length;
  const completedCount = todos.filter((t) => t.isCompleted).length;

  return (
    <div>
      <header className="mb-8 flex flex-col items-start justify-between gap-6 sm:mb-10 sm:flex-row sm:items-center md:mb-12">
        <div>
          <h1 className="font-nunito mb-2 text-4xl font-black leading-[1.1] tracking-tight text-clay-foreground sm:text-5xl md:text-6xl">
            My Tasks
          </h1>
          <p className="m-0 text-base font-medium leading-relaxed text-clay-muted sm:text-lg">
            Signed in as <span className="font-bold text-clay-foreground">{email}</span>
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Button
            onClick={() => setIsAddModalOpen(true)}
            size="lg"
            className="w-full sm:w-auto"
          >
            + Add task
          </Button>
          <Button
            variant="secondary"
            onClick={logout}
            size="lg"
            className="w-full sm:w-auto"
          >
            Sign out
          </Button>
        </div>
      </header>

      <ErrorBanner message={error} onDismiss={() => setError(null)} />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3">
        {[
          { label: 'Total', value: todos.length, gradient: 'from-purple-400 to-purple-600' },
          { label: 'Active', value: activeCount, gradient: 'from-sky-400 to-sky-600' },
          { label: 'Done', value: completedCount, gradient: 'from-emerald-400 to-emerald-600' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col items-center justify-center rounded-[32px] bg-clay-card p-5 text-center shadow-clay-card backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:shadow-clay-card-hover sm:p-6 md:col-span-1"
          >
            <div
              className={`mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br ${stat.gradient} font-nunito text-xl font-black text-white shadow-clay-button animate-clay-breathe`}
            >
              {stat.value}
            </div>
            <span className="font-nunito text-sm font-bold tracking-widest text-clay-muted uppercase">
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      <section>
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <h2 className="font-nunito m-0 text-2xl font-extrabold tracking-tight text-clay-foreground sm:text-3xl">
            Your tasks
          </h2>
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
                onClick={() => setFilter(value)}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <div className="h-12 w-12 animate-clay-breathe rounded-full bg-gradient-to-br from-purple-400 to-purple-600 shadow-clay-button" />
            <p className="m-0 text-base font-medium text-clay-muted">
              Loading tasks...
            </p>
          </div>
        ) : todos.length === 0 ? (
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
          <div className="grid gap-4">
            {todos.map((todo) => (
              <TodoItemCard
                key={todo.id}
                todo={todo}
                onToggle={handleToggle}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </section>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add a task"
      >
        <TodoForm submitLabel="Add task" onSubmit={handleCreate} />
      </Modal>
    </div>
  );
}
