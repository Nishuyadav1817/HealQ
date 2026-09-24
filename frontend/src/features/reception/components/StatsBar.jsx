const STAT_DEFS = [
  {
    key: 'waiting',
    label: 'Waiting',
    statuses: ['pending', 'confirmed'],
    tone: 'urgent',
    icon: 'M12 7v5l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    key: 'checked-in',
    label: 'Checked In',
    statuses: ['checked-in'],
    tone: 'urgent',
    icon: 'M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    key: 'in-consultation',
    label: 'In Consultation',
    statuses: ['in-consultation'],
    tone: 'active',
    icon: 'M12 4v16m8-8H4',
  },
  {
    key: 'completed',
    label: 'Completed',
    statuses: ['completed'],
    tone: 'done',
    icon: 'M5 13l4 4L19 7',
  },
  {
    key: 'no-show',
    label: 'No-show / Cancelled',
    statuses: ['no-show', 'cancelled'],
    tone: 'muted',
    icon: 'M6 18L18 6M6 6l12 12',
  },
];

const TONE_STYLES = {
  urgent: 'border-gold-200 bg-gold-50 text-gold-700',
  active: 'border-role-doctor/30 bg-role-doctor/10 text-role-doctor',
  done: 'border-success/20 bg-success/5 text-success',
  muted: 'border-surface-border bg-surface-muted/60 text-ink-subtle',
};

/** Purely derived from whatever appointment list is currently loaded —
 * no separate API call, so it's always in sync with what's on screen.
 * Visual redesign only: same STAT_DEFS reducer as before, now with an
 * icon per tile and the two "needs attention right now" buckets
 * (Waiting, Checked In) called out in gold so they read as urgent at a
 * glance on a busy board. */
const StatsBar = ({ appointments = [] }) => (
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
    {STAT_DEFS.map((stat) => {
      const count = appointments.filter((a) => stat.statuses.includes(a.status)).length;
      return (
        <div
          key={stat.key}
          className={`rounded-xl border px-4 py-3.5 shadow-soft-sm ${TONE_STYLES[stat.tone]}`}
        >
          <div className="flex items-center justify-between">
            <p className="font-display text-2xl font-bold tabular-nums">{count}</p>
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 opacity-70">
              <path d={stat.icon} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="mt-0.5 text-xs font-medium">{stat.label}</p>
        </div>
      );
    })}
  </div>
);

export default StatsBar;
