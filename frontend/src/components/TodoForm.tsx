import { type FormEvent, useEffect, useState } from 'react';
import type { Todo } from '../types';

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
    <form className="todo-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="What needs to be done?"
          maxLength={200}
          required
        />
      </div>

      <div className="form-row">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Optional details"
          rows={3}
          maxLength={2000}
        />
      </div>

      <div className="form-row">
        <label htmlFor="dueDate">Due date</label>
        <input
          id="dueDate"
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
        />
      </div>

      {error && <p className="field-error">{error}</p>}

      <div className="form-actions">
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
