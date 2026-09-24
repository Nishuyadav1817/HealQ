import { useEffect } from 'react';

/**
 * One modal implementation reused for every dialog in the Admin panel —
 * create/edit Hospital, create/edit Doctor, Patient detail, Appointment
 * detail. Closes on Escape and on backdrop click; body scroll is locked
 * while open so the page underneath doesn't scroll along with it.
 */
const Modal = ({ title, isOpen, onClose, children, size = 'md' }) => {
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        className={`relative z-10 max-h-[90vh] w-full ${widths[size]} overflow-y-auto rounded-xl border border-surface-border bg-surface-card shadow-soft-lg`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-surface-border px-5 py-4">
          <div className="min-w-0 font-display text-sm font-bold text-ink">{title}</div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-ink-muted transition-smooth hover:bg-surface-muted hover:text-ink"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
