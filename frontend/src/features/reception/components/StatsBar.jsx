const STAT_DEFS = [
  { key: 'waiting', label: 'Waiting', statuses: ['pending', 'confirmed'] },
  { key: 'checked-in', label: 'Checked In', statuses: ['checked-in'] },
  { key: 'in-consultation', label: 'In Consultation', statuses: ['in-consultation'] },
  { key: 'completed', label: 'Completed', statuses: ['completed'] },
  { key: 'no-show', label: 'No-show / Cancelled', statuses: ['no-show', 'cancelled'] },
];

/** Purely derived from whatever appointment list is currently loaded —
 * no separate API call, so it's always in sync with what's on screen. */
const StatsBar = ({ appointments = [] }) => (
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
    {STAT_DEFS.map((stat) => {
      const count = appointments.filter((a) => stat.statuses.includes(a.status)).length;
      return (
        <div key={stat.key} className="rounded border border-surface-border bg-surface-card px-4 py-3">
          <p className="text-2xl font-semibold text-ink">{count}</p>
          <p className="text-xs font-medium text-ink-muted">{stat.label}</p>
        </div>
      );
    })}
  </div>
);

export default StatsBar;
