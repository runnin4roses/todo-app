import { useState } from 'react';
import type { Todo } from '../types';
import { TodoForm } from './TodoForm';

interface TodoItemCardProps {
  todo: Todo;
  onToggle: (todo: Todo) => Promise<void>;
  onUpdate: (
    todo: Todo,
    values: { title: string; description: string; dueDate: string }
  ) => Promise<void>;
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
  onToggle,
  onUpdate,
  onDelete,
}: TodoItemCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  async function handleToggle() {
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

  if (isEditing) {
    return (
      <article className="todo-item editing">
        <TodoForm
          initial={todo}
          submitLabel="Save changes"
          onCancel={() => setIsEditing(false)}
          onSubmit={async (values) => {
            await onUpdate(todo, values);
            setIsEditing(false);
          }}
        />
      </article>
    );
  }

  const dueDateLabel = formatDueDate(todo.dueDate);

  return (
    <article className={`todo-item ${todo.isCompleted ? 'completed' : ''}`}>
      <label className="checkbox-row">
        <input
          type="checkbox"
          checked={todo.isCompleted}
          onChange={handleToggle}
          disabled={isBusy}
          aria-label={`Mark "${todo.title}" as ${
            todo.isCompleted ? 'incomplete' : 'complete'
          }`}
        />
        <div>
          <h3>{todo.title}</h3>
          {todo.description && <p>{todo.description}</p>}
          {dueDateLabel && <span className="due-date">Due {dueDateLabel}</span>}
        </div>
      </label>

      <div className="item-actions">
        <button
          type="button"
          className="secondary"
          onClick={() => setIsEditing(true)}
          disabled={isBusy}
        >
          Edit
        </button>
        <button
          type="button"
          className="danger"
          onClick={handleDelete}
          disabled={isBusy}
        >
          Delete
        </button>
      </div>
    </article>
  );
}
