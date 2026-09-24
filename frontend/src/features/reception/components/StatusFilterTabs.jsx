const TABS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'checked-in', label: 'Checked In' },
  { value: 'in-consultation', label: 'In Consultation' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'no-show', label: 'No Show' },
];

/** Same value/onChange contract as before — visual redesign only:
 * a tighter segmented-control look (shared bordered track) instead of
 * loose floating pills, so the active filter reads clearly on a dense
 * operations screen. */
const StatusFilterTabs = ({ value, onChange }) => (
  <div className="flex gap-1 overflow-x-auto rounded-lg border border-surface-border bg-surface-card p-1 sm:flex-wrap sm:overflow-visible">
    {TABS.map((tab) => (
      <button
        key={tab.value}
        type="button"
        onClick={() => onChange(tab.value)}
        className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-semibold transition-smooth ${
          value === tab.value
            ? 'bg-role-reception text-white shadow-soft-sm'
            : 'text-ink-muted hover:bg-surface-muted hover:text-ink'
        }`}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

export default StatusFilterTabs;
