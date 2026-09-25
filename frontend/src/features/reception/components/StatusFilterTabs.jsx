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

const StatusFilterTabs = ({ value, onChange }) => (
  <div className="flex gap-1.5 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
    {TABS.map((tab) => (
      <button
        key={tab.value}
        type="button"
        onClick={() => onChange(tab.value)}
        className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
          value === tab.value
            ? 'bg-role-reception text-white'
            : 'bg-surface text-ink-muted hover:bg-surface-border'
        }`}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

export default StatusFilterTabs;
