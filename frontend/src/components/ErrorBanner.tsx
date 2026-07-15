interface ErrorBannerProps {
  message: string | null;
  onDismiss: () => void;
}

export function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  if (!message) {
    return null;
  }

  return (
    <div
      className="mb-6 flex items-center justify-between gap-4 rounded-[24px] border-2 border-clay-danger-border bg-clay-danger-light px-6 py-4 text-clay-danger-text shadow-clay-pressed"
      role="alert"
    >
      <span className="text-base font-medium leading-relaxed">{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss error"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border-0 bg-white/60 text-xl font-bold text-clay-danger-text transition-all duration-200 hover:-translate-y-0.5 hover:bg-white active:scale-95"
      >
        ×
      </button>
    </div>
  );
}
