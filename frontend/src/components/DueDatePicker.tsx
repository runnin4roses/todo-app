import { useButtonClickSound } from '../hooks/useButtonClickSound';
import {
  DUE_DATE_QUICK_OPTIONS,
  getActiveQuickDueOption,
  getDateStringFromOffset,
} from '../utils/dueDate';
import { DueDateIndicator } from './DueDateIndicator';

interface DueDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  inputClass: string;
}

export function DueDatePicker({
  value,
  onChange,
  inputClass,
}: DueDatePickerProps) {
  const { withClickSound } = useButtonClickSound();
  const activeQuick = getActiveQuickDueOption(value);
  const today = getDateStringFromOffset(0);

  function handleQuickPick(offsetDays: number, urgency: string) {
    const nextDate = getDateStringFromOffset(offsetDays);
    onChange(activeQuick === urgency && value === nextDate ? '' : nextDate);
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap gap-2 rounded-[20px] bg-[#EFEBF5] p-1.5 shadow-clay-pressed">
        {DUE_DATE_QUICK_OPTIONS.map((option) => {
          const isSelected = activeQuick === option.urgency;

          return (
            <button
              key={option.urgency}
              type="button"
              onClick={withClickSound(() =>
                handleQuickPick(option.offsetDays, option.urgency)
              )}
              aria-pressed={isSelected}
              className={[
                'inline-flex flex-1 items-center justify-center gap-2 rounded-[16px] border-0 px-3 py-2.5 font-nunito text-sm font-bold transition-all duration-200 sm:flex-initial sm:px-4',
                isSelected
                  ? 'bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-white shadow-clay-button'
                  : 'bg-transparent text-clay-muted hover:text-clay-foreground',
              ].join(' ')}
            >
              <DueDateIndicator urgency={option.urgency} size="legend" />
              {option.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-2">
        <label
          htmlFor="dueDate"
          className="font-nunito text-sm font-bold tracking-wide text-clay-foreground"
        >
          Custom date
          <span className="ml-1 font-medium text-clay-muted">(optional)</span>
        </label>
        <input
          id="dueDate"
          type="date"
          value={value}
          min={today}
          onChange={(event) => onChange(event.target.value)}
          className={inputClass}
        />
      </div>
    </div>
  );
}
