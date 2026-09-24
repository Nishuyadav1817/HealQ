import React from "react";
/**
 * Today's headline queue numbers. Every figure here is derived purely
 * from the same `queueView` payload useQueue already fetches on
 * DoctorQueuePage (no separate endpoint), so it can never drift from
 * what the cards above are showing:
 *  - Current Token / Patients Waiting / Remaining Appointments are all
 *    computed straight from currentPatient + waitingList, exactly the
 *    same fields CurrentPatientCard/NextPatientCard/QueueList render.
 *  - Patients Completed is read defensively from an optional
 *    `queueView.completedCount` — the one figure a running waiting-list
 *    snapshot can't itself derive (skipped patients leave the list the
 *    same way completed ones do). It lights up the moment the backend
 *    includes that count, and reads '—' rather than guessing a number
 *    until then, the same convention QueueControls already uses for
 *    averageConsultationMinutes.
 */
const TodayStats = ({ queueView, waitingList = [] }) => {
  const currentToken = queueView?.currentPatient?.tokenNumber;
  const waitingCount = waitingList.length;
  const remaining = waitingCount + (queueView?.currentPatient ? 1 : 0);
  const completed = queueView?.completedCount;

  const stats = [
    { key: 'current', label: 'Current Token', value: currentToken != null ? `#${currentToken}` : '—' },
    { key: 'waiting', label: 'Patients Waiting', value: waitingCount },
    { key: 'remaining', label: 'Remaining Appointments', value: remaining },
    { key: 'completed', label: 'Patients Completed', value: completed != null ? completed : '—' },
  ];

  return (
    <div>
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink-subtle">Today's Overview</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.key}
            className="rounded-lg border border-surface-border bg-surface-card px-4 py-3.5 shadow-soft-sm"
          >
            <p className="font-display text-2xl font-bold tabular-nums text-ink">{stat.value}</p>
            <p className="mt-0.5 text-xs font-medium text-ink-subtle">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodayStats;
