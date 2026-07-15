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
  variant?: 'default' | 'modal';
}

export function TodoForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel,
  variant = 'default',
}: TodoFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isModal = variant === 'modal';
  const inputClass = isModal ? 'clay-input-compact' : 'clay-input';
  const textareaClass = isModal ? 'clay-textarea-compact' : 'clay-textarea';

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
    <form className="flex flex-col" onSubmit={handleSubmit}>
      <div className={isModal ? 'grid gap-4' : 'grid gap-5'}>
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
            autoFocus={isModal}
            className={inputClass}
          />
        </div>

        <div className="grid gap-2">
          <label
            htmlFor="description"
            className="font-nunito text-sm font-bold tracking-wide text-clay-foreground"
          >
            Description
            <span className="ml-1 font-medium text-clay-muted">(optional)</span>
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Add a few details..."
            rows={isModal ? 2 : 3}
            maxLength={2000}
            className={textareaClass}
          />
        </div>

        <div className="grid gap-2">
          <label
            htmlFor="dueDate"
            className="font-nunito text-sm font-bold tracking-wide text-clay-foreground"
          >
            Due date
            <span className="ml-1 font-medium text-clay-muted">(optional)</span>
          </label>
          <input
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {error && (
        <p className="mt-4 m-0 rounded-[16px] bg-clay-danger-light px-4 py-3 text-sm font-medium text-clay-danger-text">
          {error}
        </p>
      )}

      <div
        className={
          isModal
            ? 'mt-6 flex flex-col-reverse gap-3 border-t border-[#EFEBF5] pt-5 sm:flex-row sm:justify-end'
            : 'mt-6 flex flex-col gap-3 sm:flex-row'
        }
      >
        {onCancel && (
          <Button
            type="button"
            variant={isModal ? 'ghost' : 'secondary'}
            onClick={onCancel}
            className={isModal ? 'sm:min-w-[7rem]' : 'sm:flex-1'}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting}
          className={isModal ? 'sm:min-w-[9rem]' : 'sm:flex-1'}
        >
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
