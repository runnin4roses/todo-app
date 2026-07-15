import { type ReactNode, useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  icon,
  children,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };

    const handleClick = (e: MouseEvent) => {
      if (e.target === dialog) {
        onClose();
      }
    };

    dialog.addEventListener('cancel', handleCancel);
    dialog.addEventListener('click', handleClick);

    return () => {
      dialog.removeEventListener('cancel', handleCancel);
      dialog.removeEventListener('click', handleClick);
    };
  }, [onClose]);

  return (
    <dialog ref={dialogRef} className="clay-modal">
      <div className="flex max-h-[calc(100vh-3rem)] flex-col">
        <div className="relative shrink-0 bg-gradient-to-br from-[#F4F1FA] via-white to-white px-6 pb-5 pt-6 sm:px-8">
          <div className="flex items-start gap-4 pr-10">
            {icon && (
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-white shadow-clay-button"
                aria-hidden="true"
              >
                {icon}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h2 className="font-nunito m-0 text-2xl font-extrabold leading-tight tracking-tight text-clay-foreground">
                {title}
              </h2>
              {description && (
                <p className="mt-1.5 m-0 text-sm font-medium leading-relaxed text-clay-muted">
                  {description}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-xl border-0 bg-[#EFEBF5] text-lg font-bold leading-none text-clay-muted shadow-clay-pressed transition-all duration-200 hover:text-clay-foreground active:scale-95"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5 sm:px-8 sm:py-6">{children}</div>
      </div>
    </dialog>
  );
}
