/**
 * Two thin wrappers around the same "nothing to show yet" layout — one
 * neutral (empty list), one negative (a request failed). Reused instead
 * of each page hand-rolling its own centered message block.
 */
export const EmptyState = ({ title, description, action }) => (
  <div className="flex flex-col items-center justify-center gap-2 rounded border border-dashed border-surface-border py-14 text-center">
    <p className="text-sm font-semibold text-ink">{title}</p>
    {description && <p className="max-w-sm text-sm text-ink-muted">{description}</p>}
    {action && <div className="mt-2">{action}</div>}
  </div>
);

export const ErrorNotice = ({ message = 'Something went wrong. Please try again.', action }) => (
  <div className="flex flex-col items-center justify-center gap-2 rounded border border-danger/30 bg-danger/5 py-10 text-center">
    <p className="text-sm font-medium text-danger">{message}</p>
    {action && <div className="mt-1">{action}</div>}
  </div>
);

export const Spinner = ({ label = 'Loading…' }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-14">
    <span className="h-8 w-8 animate-spin rounded-full border-2 border-surface-border border-t-brand-500" />
    <p className="text-sm text-ink-muted">{label}</p>
  </div>
);
