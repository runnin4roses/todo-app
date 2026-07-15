import type { Todo } from '../types';

export function getDisplayName(email: string) {
  const local = email.split('@')[0] ?? '';
  const firstPart = local.split(/[._-]/)[0] ?? local;

  if (!firstPart) {
    return 'there';
  }

  return firstPart.charAt(0).toUpperCase() + firstPart.slice(1).toLowerCase();
}

export function getTimeGreeting(date = new Date()) {
  const hour = date.getHours();

  if (hour < 12) {
    return 'Good morning';
  }

  if (hour < 17) {
    return 'Good afternoon';
  }

  return 'Good evening';
}

function getTodayDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isDueToday(dueDate: string, today = getTodayDateString()) {
  return dueDate.slice(0, 10) === today;
}

export function buildTaskSummary(activeTodos: Todo[]) {
  const count = activeTodos.length;
  const dueTodayCount = activeTodos.filter(
    (todo) => todo.dueDate && isDueToday(todo.dueDate)
  ).length;

  if (count === 0) {
    return "You're all caught up — no tasks left to do.";
  }

  const taskWord = count === 1 ? 'task' : 'tasks';
  let summary = `You have ${count} ${taskWord} to get done`;

  if (dueTodayCount === 0) {
    summary += ', and none due today.';
  } else if (dueTodayCount === 1) {
    summary += ', with 1 due today.';
  } else {
    summary += `, with ${dueTodayCount} due today.`;
  }

  return summary;
}
