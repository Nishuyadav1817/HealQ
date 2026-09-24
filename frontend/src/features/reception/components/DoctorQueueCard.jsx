import Card from '../../../components/ui/Card';
import TokenChip from './ui/TokenChip';

/**
 * A compact per-doctor status card for the operations board — "which
 * doctors have patients waiting right now, and how many". Purely a
 * presentation of groupByDoctor's output; no independent data of its
 * own, no actions (checking a patient in/out still happens on their
 * appointment card below).
 */
const DoctorQueueCard = ({ doctor }) => {
  const { name, department, totalToday, waitingCount, nowServingToken, nextToken, isInConsultation } = doctor;

  return (
    <Card className={`min-w-[240px] ${isInConsultation ? 'border-role-doctor/40' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">Dr. {name || 'Unassigned'}</p>
          {department && <p className="truncate text-xs text-ink-subtle">{department}</p>}
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
            isInConsultation
              ? 'bg-role-doctor/10 text-role-doctor'
              : waitingCount > 0
              ? 'bg-gold-100 text-gold-700'
              : 'bg-surface-muted text-ink-subtle'
          }`}
        >
          {isInConsultation ? 'In Consultation' : waitingCount > 0 ? 'Patients Waiting' : 'No Queue'}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-subtle">Now serving</p>
          <TokenChip value={nowServingToken} tone="active" size="sm" className="mt-1" />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-subtle">Next up</p>
          <TokenChip value={nextToken} tone="default" size="sm" className="mt-1" />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-surface-border pt-2.5 text-xs text-ink-muted">
        <span>{waitingCount} waiting</span>
        <span>{totalToday} today</span>
      </div>
    </Card>
  );
};

export default DoctorQueueCard;
