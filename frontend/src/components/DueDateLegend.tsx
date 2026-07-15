import { DueDateIndicator } from './DueDateIndicator';

interface DueDateLegendProps {
  showToday: boolean;
  showTomorrow: boolean;
  showThisWeek: boolean;
}

export function DueDateLegend({
  showToday,
  showTomorrow,
  showThisWeek,
}: DueDateLegendProps) {
  if (!showToday && !showTomorrow && !showThisWeek) {
    return null;
  }

  return (
    <div
      className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-2 px-1"
      aria-label="Due date indicators"
    >
      <span className="font-nunito text-xs font-bold uppercase tracking-widest text-clay-muted">
        Due
      </span>
      {showToday && (
        <span className="inline-flex items-center gap-2 text-sm font-medium text-clay-muted">
          <DueDateIndicator urgency="today" size="legend" />
          Today
        </span>
      )}
      {showTomorrow && (
        <span className="inline-flex items-center gap-2 text-sm font-medium text-clay-muted">
          <DueDateIndicator urgency="tomorrow" size="legend" />
          Tomorrow
        </span>
      )}
      {showThisWeek && (
        <span className="inline-flex items-center gap-2 text-sm font-medium text-clay-muted">
          <DueDateIndicator urgency="thisWeek" size="legend" />
          This week
        </span>
      )}
    </div>
  );
}
