import { useCallback, useEffect, useState } from 'react';
import { ApiError, api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { Todo, TodoFilter } from '../types';
import { ErrorBanner } from './ErrorBanner';
import { TodoForm } from './TodoForm';
import { TodoItemCard } from './TodoItemCard';

export function TodoApp() {
  const { token, email, logout } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<TodoFilter>('all');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>My Tasks</h1>
          <p>Signed in as {email}</p>
        </div>
        <button type="button" className="secondary" onClick={logout}>
          Sign out
        </button>
      </header>

      <ErrorBanner message={error} onDismiss={() => setError(null)} />

      <section className="panel">
        <h2>Add a task</h2>
        <TodoForm submitLabel="Add task" onSubmit={handleCreate} />
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Your tasks</h2>
          <div className="filter-group" role="tablist" aria-label="Filter tasks">
            {(['all', 'active', 'completed'] as TodoFilter[]).map((value) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={filter === value}
                className={filter === value ? 'active' : ''}
                onClick={() => setFilter(value)}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <p className="muted">Loading tasks...</p>
        ) : todos.length === 0 ? (
          <p className="muted">
            {filter === 'all'
              ? 'No tasks yet. Add your first one above.'
              : `No ${filter} tasks.`}
          </p>
        ) : (
          <div className="todo-list">
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
    </div>
  );
}
