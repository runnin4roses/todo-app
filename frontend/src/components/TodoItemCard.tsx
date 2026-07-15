import { useId, useState } from 'react';
import type { Todo } from '../types';
import { TodoForm } from './TodoForm';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { EditIcon, TrashIcon } from './ui/Icons';

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
  const checkboxId = useId();
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
      <Card as="article" interactive>
        <TodoForm
          initial={todo}
          submitLabel="Save changes"
          onCancel={() => setIsEditing(false)}
          onSubmit={async (values) => {
            await onUpdate(todo, values);
            setIsEditing(false);
          }}
        />
      </Card>
    );
  }

  const dueDateLabel = formatDueDate(todo.dueDate);

  return (
    <Card as="article" interactive>
      <div className="flex items-start gap-4">
        <label
          htmlFor={checkboxId}
          className="relative mt-1 flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center"
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
              'flex h-7 w-7 items-center justify-center rounded-full border-0 text-sm font-bold transition-all duration-200',
              'shadow-clay-button peer-checked:bg-gradient-to-br peer-checked:from-emerald-400 peer-checked:to-emerald-600 peer-checked:text-white',
              'peer-focus-visible:ring-4 peer-focus-visible:ring-clay-accent/30',
              todo.isCompleted
                ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white'
                : 'bg-white text-transparent',
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
                  'font-nunito m-0 text-xl font-bold leading-snug tracking-tight',
                  todo.isCompleted
                    ? 'text-clay-muted line-through decoration-2'
                    : 'text-clay-foreground',
                ].join(' ')}
              >
                {todo.title}
              </h3>
            </label>

            <div className="flex shrink-0 gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsEditing(true)}
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
              <p className="m-0 text-base font-medium leading-relaxed text-clay-muted">
                {todo.description}
              </p>
            </label>
          )}

          {dueDateLabel && (
            <span className="mt-3 inline-flex items-center rounded-full bg-clay-accent/10 px-4 py-1.5 text-sm font-bold tracking-wide text-clay-accent">
              Due {dueDateLabel}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
