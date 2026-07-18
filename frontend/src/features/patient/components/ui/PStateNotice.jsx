/**
 * HealQ's patient-facing empty/error/loading states. Same API as
 * components/ui/StateNotice — blue-tinted instead of neutral gray.
 */
export const EmptyState = ({ title, description, action }) => (
  <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-healq-200 bg-healq-50/40 py-14 text-center">
    <p className="text-sm font-semibold text-ink">{title}</p>
    {description && <p className="max-w-sm text-sm text-ink-muted">{description}</p>}
    {action && <div className="mt-2">{action}</div>}
  </div>
);

export const ErrorNotice = ({ message = 'Something went wrong. Please try again.', action }) => (
  <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-danger/30 bg-danger/5 py-10 text-center">
    <p className="text-sm font-medium text-danger">{message}</p>
    {action && <div className="mt-1">{action}</div>}
  </div>
);

export const Spinner = ({ label = 'Loading…' }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-14">
    <span className="h-8 w-8 animate-spin rounded-full border-2 border-healq-100 border-t-healq-600" />
    <p className="text-sm text-ink-muted">{label}</p>
  </div>
);
