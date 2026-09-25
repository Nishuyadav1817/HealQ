import Button from './Button';

/**
 * Small confirmation dialog for a destructive/irreversible-feeling
 * action (deactivate a hospital, deactivate a doctor, …). Pulled out of
 * what used to be near-identical inline markup on the Hospitals and
 * Doctors admin pages so every "are you sure?" prompt in the app shares
 * one implementation.
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
    <div className="absolute inset-0 bg-ink/40" onClick={onCancel} aria-hidden="true" />
    <div
      role="alertdialog"
      aria-modal="true"
      className="relative z-10 w-full max-w-sm rounded border border-surface-border bg-surface-card p-5 shadow-xl"
    >
      <h2 className="text-sm font-semibold text-ink">{title}</h2>
      {description && <p className="mt-2 text-sm text-ink-muted">{description}</p>}
      {error && <p className="mt-2 text-xs font-medium text-danger">{error}</p>}
      <div className="mt-4 flex justify-end gap-2">
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
