import Button from './Button';

/**
 * Small confirmation dialog for a destructive/irreversible-feeling
 * action (deactivate a hospital, deactivate a doctor, …). One
 * implementation shared by every "are you sure?" prompt in the app.
 */
const ConfirmDialog = ({
  title,
  description,
  confirmLabel = 'Confirm',
  isLoading = false,
  error,
  onConfirm,
  onCancel,
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-ink/50 backdrop-blur-[2px]" onClick={onCancel} aria-hidden="true" />
    <div
      role="alertdialog"
      aria-modal="true"
      className="relative z-10 w-full max-w-sm rounded-xl border border-surface-border bg-surface-card p-5 shadow-soft-lg"
    >
      <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-danger/10 text-danger">
        <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5">
          <path d="M12 9v4m0 4h.01M10.3 3.9L2.5 17a1.5 1.5 0 001.3 2.3h16.4a1.5 1.5 0 001.3-2.3L13.7 3.9a1.5 1.5 0 00-2.6 0z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <h2 className="font-display text-sm font-bold text-ink">{title}</h2>
      {description && <p className="mt-2 text-sm text-ink-muted">{description}</p>}
      {error && <p className="mt-2 text-xs font-medium text-danger">{error}</p>}
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="danger" isLoading={isLoading} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </div>
  </div>
);

export default ConfirmDialog;
