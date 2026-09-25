import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import { EmptyState } from '../../../components/ui/StateNotice';
import { useCallNextPatient } from '../hooks/useQueueActions';

/**
 * `next` is waitingList[0] — the lowest-token released patient still
 * WAITING (see doctorAssistant.service.js getQueue). Calling doesn't
 * take a specific appointment id: the backend always selects whoever is
 * next itself (QueueService.callNext), so this button can't get out of
 * sync with what's actually shown here.
 *
 * Disabled while a current patient still needs attention — one patient
 * with the doctor at a time keeps the workflow unambiguous, even though
 * the backend itself doesn't enforce that ordering.
 */
const NextPatientCard = ({ next, hasCurrentPatient, doctorId, date, queueStatus }) => {
  const callMutation = useCallNextPatient();

  const canCall = !!next && !hasCurrentPatient && queueStatus === 'active';

  return (
    <Card>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-subtle">Next Patient</h2>

      {!next ? (
        <EmptyState title="Queue is empty" description="No patients are waiting right now." />
      ) : (
        <>
          <p className="text-lg font-semibold text-ink">Token #{next.tokenNumber}</p>
          <p className="text-sm text-ink-muted">{next.patient?.fullName}</p>
          {next.estimatedWaitingMinutes != null && (
            <p className="mt-1 text-xs text-ink-subtle">~{next.estimatedWaitingMinutes} min estimated wait</p>
          )}
        </>
      )}

      <div className="mt-4">
        <Button
          isLoading={callMutation.isPending}
          disabled={!canCall}
          onClick={() => callMutation.mutate({ doctor: doctorId, date })}
        >
          Call Next Patient
        </Button>
        {hasCurrentPatient && next && (
          <p className="mt-2 text-xs text-ink-subtle">Finish with the current patient before calling the next.</p>
        )}
        {queueStatus === 'paused' && (
          <p className="mt-2 text-xs text-danger">Queue is paused — resume it to call patients.</p>
        )}
      </div>
    </Card>
  );
};

export default NextPatientCard;
