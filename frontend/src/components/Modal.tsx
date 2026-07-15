import { type ReactNode, useEffect, useRef } from 'react';
import { Button } from './ui/Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
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
    <dialog
      ref={dialogRef}
      className="max-h-[calc(100vh-4rem)] w-[calc(100vw-2rem)] max-w-[540px] rounded-[40px] border-0 bg-clay-card p-0 shadow-clay-modal backdrop-blur-xl"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between gap-4 border-b border-white/40 px-6 py-5 sm:px-8 sm:py-6">
          <h2 className="font-nunito m-0 text-2xl font-extrabold tracking-tight text-clay-foreground">
            {title}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close dialog"
            className="!h-11 !w-11 !min-w-0 !px-0 text-2xl"
          >
            ✕
          </Button>
        </div>
        <div className="overflow-y-auto px-6 py-6 sm:px-8 sm:py-8">{children}</div>
      </div>
    </dialog>
  );
}
