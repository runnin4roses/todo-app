import type { DueDateUrgency } from '../utils/dueDate';

interface DueDateIndicatorProps {
  urgency: Exclude<DueDateUrgency, 'none'>;
  isCompleted?: boolean;
  size?: 'row' | 'legend';
  className?: string;
}

const labels: Record<Exclude<DueDateUrgency, 'none'>, string> = {
  today: 'Due today',
  tomorrow: 'Due tomorrow',
  thisWeek: 'Due this week',
};

export function DueDateIndicator({
  urgency,
  isCompleted = false,
  size = 'row',
  className = '',
}: DueDateIndicatorProps) {
  const isLegend = size === 'legend';
  const dimension = isLegend ? 'h-4 w-4' : 'h-5 w-5';
  const muted = isCompleted ? 'opacity-40' : '';

  if (urgency === 'today') {
    return (
      <span
        role="img"
        aria-label={labels.today}
        title={labels.today}
        className={[
          'inline-flex shrink-0 items-center justify-center',
          dimension,
          muted,
          isCompleted ? '' : 'animate-clay-breathe',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <span
          className={[
            'h-full w-full rotate-45 rounded-[5px]',
            isCompleted
              ? 'bg-amber-200/80 shadow-none'
              : 'bg-gradient-to-br from-amber-300 to-amber-500 shadow-clay-button',
          ].join(' ')}
          aria-hidden="true"
        />
      </span>
    );
  }

  if (urgency === 'tomorrow') {
    return (
      <span
        role="img"
        aria-label={labels.tomorrow}
        title={labels.tomorrow}
        className={[
          'inline-block shrink-0 rounded-full',
          dimension,
          muted,
          isCompleted
            ? 'bg-sky-200/80 shadow-none'
            : 'bg-gradient-to-br from-sky-300 to-sky-500 shadow-clay-button',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      />
    );
  }

  return (
    <span
      role="img"
      aria-label={labels.thisWeek}
      title={labels.thisWeek}
      className={[
        'inline-block shrink-0 rounded-[6px]',
        dimension,
        muted,
        isCompleted
          ? 'bg-violet-200/80 shadow-none'
          : 'bg-gradient-to-br from-violet-300 to-violet-500 shadow-clay-button',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    />
  );
}
