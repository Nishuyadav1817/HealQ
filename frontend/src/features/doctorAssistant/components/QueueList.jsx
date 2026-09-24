import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/StateNotice';
import { useSkipPatient } from '../hooks/useQueueActions';
import useFlashHighlight from '../hooks/useFlashHighlight';
import { formatTimeSlot } from '../utils/format';

const formatEta = (value) =>
  value ? new Date(value).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : '—';

/**
 * One row of the "everyone after next" list. Broken out from QueueList
 * so each row can own its own useFlashHighlight instance (hooks can't be
 * called inside the parent's .map loop) — a row flashes only when *its*
 * token number changes, e.g. a new entry arrives at this position after
 * the ones ahead of it are called or skipped.
 */
const QueueRow = ({ entry, onSkip, isSkipping }) => {
  const appointmentId = entry.appointment?._id || entry.appointment;
  const isFlashing = useFlashHighlight(entry.tokenNumber);
  const timeSlot = formatTimeSlot(entry.appointment?.timeSlot);

  return (
    <li
      className="flex flex-wrap items-center justify-between gap-3 rounded-lg px-2 py-3"
      style={{ backgroundColor: isFlashing ? '#FEF9EC' : undefined, transition: 'background-color 900ms ease-out' }}
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink">
          #{entry.tokenNumber} · {entry.patient?.fullName}
        </p>
        <p className="text-xs text-ink-subtle">
          Position {entry.queuePosition} · ETA {formatEta(entry.estimatedReportingTime)}
          {entry.estimatedWaitingMinutes != null && ` (~${entry.estimatedWaitingMinutes} min)`}
          {timeSlot && ` · Appt ${timeSlot}`}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {entry.appointment?.status && <Badge status={entry.appointment.status} />}
        <Button size="sm" variant="ghost" isLoading={isSkipping} onClick={() => onSkip(appointmentId)}>
          Skip
        </Button>
      </div>
    </li>
  );
};

/**
 * Everyone still WAITING and released to the doctor queue, excluding
 * whoever is already shown as "next" (waitingList[0], rendered on
 * NextPatientCard instead) — this panel is "everyone after that".
 */
const QueueList = ({ entries = [], totalWaiting }) => {
  const skipMutation = useSkipPatient();

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-subtle">Queue</h2>
        <span className="text-xs font-medium text-ink-subtle">{totalWaiting} waiting</span>
      </div>

      {entries.length === 0 ? (
        <EmptyState title="Nobody else waiting" description="The rest of the queue is empty." />
      ) : (
        <ul className="divide-y divide-surface-border">
          {entries.map((entry) => {
            const appointmentId = entry.appointment?._id || entry.appointment;
            return (
              <QueueRow
                key={appointmentId}
                entry={entry}
                isSkipping={skipMutation.isPending}
                onSkip={(id) => skipMutation.mutate({ appointmentId: id })}
              />
            );
          })}
        </ul>
      )}
    </Card>
  );
};

export default QueueList;
