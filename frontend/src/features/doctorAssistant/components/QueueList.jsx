import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import { EmptyState } from '../../../components/ui/StateNotice';
import { useSkipPatient } from '../hooks/useQueueActions';

const formatEta = (value) =>
  value ? new Date(value).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : '—';

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
              <li key={appointmentId} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-medium text-ink">
                    #{entry.tokenNumber} · {entry.patient?.fullName}
                  </p>
                  <p className="text-xs text-ink-subtle">
                    Position {entry.queuePosition} · ETA {formatEta(entry.estimatedReportingTime)}
                    {entry.estimatedWaitingMinutes != null && ` (~${entry.estimatedWaitingMinutes} min)`}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  isLoading={skipMutation.isPending}
                  onClick={() => skipMutation.mutate({ appointmentId })}
                >
                  Skip
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
};

export default QueueList;
