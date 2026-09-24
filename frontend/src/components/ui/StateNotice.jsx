/**
 * Shared "nothing to show yet" layout — neutral (empty list), negative
 * (a request failed), positive (an action succeeded), and in-progress
 * (loading) — reused instead of each page hand-rolling its own centered
 * message block. One version of this pattern for every panel: Admin,
 * Reception, Doctor Assistant, and Patient all render the same icon
 * treatment, just with whatever `icon` name fits the context.
 */
const ICONS = {
  inbox: (
    <path d="M4 7h16M4 12h10M4 17h7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  ),
  calendar: (
    <path
      d="M8 3v3M16 3v3M4 9h16M5 6h14a1 1 0 011 1v12a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  search: (
    <path
      d="M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  hospital: (
    <path
      d="M6 21V9l6-4 6 4v12M10 21v-6h4v6M9 12h.01M15 12h.01"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  alert: (
    <path
      d="M12 9v4m0 4h.01M10.29 3.86l-8.18 14.18A1 1 0 003 19.5h18a1 1 0 00.89-1.46L13.71 3.86a1 1 0 00-1.42 0z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  check: (
    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  ),
  bell: (
    <path
      d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
};

const StateIcon = ({ name }) => (
  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
    {ICONS[name] || ICONS.inbox}
  </svg>
);

export const EmptyState = ({ title, description, action, icon = 'inbox' }) => (
  <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-surface-border bg-surface-muted/40 px-6 py-14 text-center">
    <span className="mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-surface-card text-ink-subtle shadow-soft-sm">
      <StateIcon name={icon} />
    </span>
    <p className="text-sm font-semibold text-ink">{title}</p>
    {description && <p className="max-w-sm text-sm text-ink-muted">{description}</p>}
    {action && <div className="mt-2">{action}</div>}
  </div>
);

export const ErrorNotice = ({ message = 'Something went wrong. Please try again.', action }) => (
  <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-danger/20 bg-danger/5 px-6 py-10 text-center">
    <span className="mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-surface-card text-danger shadow-soft-sm">
      <StateIcon name="alert" />
    </span>
    <p className="text-sm font-medium text-danger">{message}</p>
    {action && <div className="mt-1">{action}</div>}
  </div>
);

export const SuccessNotice = ({ title, description, action }) => (
  <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-primary-200 bg-primary-50/60 px-6 py-8 text-center">
    <span className="mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-primary-600 text-white shadow-soft-sm">
      <StateIcon name="check" />
    </span>
    {title && <p className="text-sm font-semibold text-ink">{title}</p>}
    {description && <p className="max-w-sm text-sm text-ink-muted">{description}</p>}
    {action && <div className="mt-2">{action}</div>}
  </div>
);

export const Spinner = ({ label = 'Loading…' }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-14">
    <span className="h-8 w-8 animate-spin rounded-full border-2 border-surface-border border-t-primary-600" />
    <p className="text-sm text-ink-muted">{label}</p>
  </div>
);

/** Skeleton placeholder shaped like the cards it stands in for, so a
 * loading dashboard/list never collapses to an empty-looking page while
 * data is in flight. */
export const CardSkeleton = ({ lines = 3, className = '' }) => (
  <div className={`animate-pulse rounded-lg border border-surface-border bg-surface-card p-4 ${className}`}>
    <div className="h-4 w-1/3 rounded bg-surface-muted" />
    <div className="mt-3 space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-3 rounded bg-surface-muted" style={{ width: `${85 - i * 15}%` }} />
      ))}
    </div>
  </div>
);

export { StateIcon };
