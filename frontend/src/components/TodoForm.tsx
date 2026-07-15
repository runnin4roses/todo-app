import { type FormEvent, useEffect, useState } from 'react';
import type { Todo } from '../types';
import { Button } from './ui/Button';

interface TodoFormProps {
  initial?: Todo | null;
  onSubmit: (values: {
    title: string;
    description: string;
    dueDate: string;
  }) => Promise<void>;
  onCancel?: () => void;
  submitLabel: string;
}

export function TodoForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel,
}: TodoFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setTitle(initial?.title ?? '');
    setDescription(initial?.description ?? '');
    setDueDate(initial?.dueDate ? initial.dueDate.slice(0, 10) : '');
    setError(null);
  }, [initial]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    if (dueDate) {
      const selected = new Date(`${dueDate}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) {
        setError('Due date cannot be in the past.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ title, description, dueDate });
      if (!initial) {
        setTitle('');
        setDescription('');
        setDueDate('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save todo.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <label
          htmlFor="title"
          className="font-nunito text-sm font-bold tracking-wide text-clay-foreground"
        >
          Title
        </label>
        <input
          id="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="What needs to be done?"
          maxLength={200}
          required
          className="clay-input"
        />
      </div>

      <div className="grid gap-2">
        <label
          htmlFor="description"
          className="font-nunito text-sm font-bold tracking-wide text-clay-foreground"
        >
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Optional details"
          rows={3}
          maxLength={2000}
          className="clay-textarea"
        />
      </div>

      <div className="grid gap-2">
        <label
          htmlFor="dueDate"
          className="font-nunito text-sm font-bold tracking-wide text-clay-foreground"
        >
          Due date
        </label>
        <input
          id="dueDate"
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
          className="clay-input"
        />
      </div>

      {error && (
        <p className="m-0 rounded-[20px] bg-clay-danger-light px-4 py-3 text-sm font-medium text-clay-danger-text">
          {error}
        </p>
      )}

      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
        <Button type="submit" disabled={isSubmitting} className="sm:flex-1">
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            className="sm:flex-1"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
