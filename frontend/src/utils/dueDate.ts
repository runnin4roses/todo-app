import type { Todo } from '../types';

export type DueDateUrgency = 'today' | 'tomorrow' | 'thisWeek' | 'none';

export interface DueDateDisplay {
  label: string;
  urgency: DueDateUrgency;
}

function toDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDateStringFromOffset(offsetDays: number, from = new Date()) {
  const date = new Date(from);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + offsetDays);
  return toDateString(date);
}

export const DUE_DATE_QUICK_OPTIONS = [
  { urgency: 'today' as const, label: 'Today', offsetDays: 0 },
  { urgency: 'tomorrow' as const, label: 'Tomorrow', offsetDays: 1 },
  { urgency: 'thisWeek' as const, label: 'In one week', offsetDays: 7 },
] as const;

export function getActiveQuickDueOption(dueDate: string, now = new Date()) {
  if (!dueDate) {
    return null;
  }

  const normalized = dueDate.slice(0, 10);

  return (
    DUE_DATE_QUICK_OPTIONS.find(
      (option) =>
        getDateStringFromOffset(option.offsetDays, now) === normalized
    )?.urgency ?? null
  );
}

function daysUntilDue(dueDate: string, now = new Date()) {
  const due = new Date(`${dueDate.slice(0, 10)}T00:00:00`);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

const URGENCY_SORT_ORDER: Record<DueDateUrgency, number> = {
  today: 0,
  tomorrow: 1,
  thisWeek: 2,
  none: 3,
};

export function getDueDateSortOrder(todo: Todo, now = new Date()) {
  if (!todo.dueDate) {
    return URGENCY_SORT_ORDER.none;
  }

  const days = daysUntilDue(todo.dueDate, now);

  if (days < 0) {
    return -1;
  }

  return URGENCY_SORT_ORDER[getDueDateUrgency(todo.dueDate, now)];
}

export function compareTodosByDueDate(a: Todo, b: Todo, now = new Date()) {
  const rankA = getDueDateSortOrder(a, now);
  const rankB = getDueDateSortOrder(b, now);

  if (rankA !== rankB) {
    return rankA - rankB;
  }

  const daysA = a.dueDate ? daysUntilDue(a.dueDate, now) : Number.POSITIVE_INFINITY;
  const daysB = b.dueDate ? daysUntilDue(b.dueDate, now) : Number.POSITIVE_INFINITY;

  if (daysA !== daysB) {
    return daysA - daysB;
  }

  return (
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getDueDateUrgency(
  dueDate: string,
  now = new Date()
): DueDateUrgency {
  const days = daysUntilDue(dueDate, now);

  if (days < 0 || days > 7) {
    return 'none';
  }

  if (days === 0) {
    return 'today';
  }

  if (days === 1) {
    return 'tomorrow';
  }

  return 'thisWeek';
}

export function isDueToday(dueDate: string, now = new Date()) {
  return getDueDateUrgency(dueDate, now) === 'today';
}

const urgencyLabels: Record<Exclude<DueDateUrgency, 'none'>, string> = {
  today: 'Due today',
  tomorrow: 'Due tomorrow',
  thisWeek: 'Due this week',
};

export function formatDueDateDisplay(
  dueDate: string | null
): DueDateDisplay | null {
  if (!dueDate) {
    return null;
  }

  const urgency = getDueDateUrgency(dueDate);

  if (urgency === 'none') {
    return null;
  }

  return {
    label: urgencyLabels[urgency],
    urgency,
  };
}

export function shouldShowDueIndicator(
  urgency: DueDateUrgency
): urgency is Exclude<DueDateUrgency, 'none'> {
  return urgency !== 'none';
}
