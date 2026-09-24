import React from "react";
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/StateNotice';
import { useCallNextPatient } from '../hooks/useQueueActions';
import useFlashHighlight from '../hooks/useFlashHighlight';
import { formatTimeSlot } from '../utils/format';

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
 *
 * Sits directly below CurrentPatientCard so the two "who's involved
 * right now" cards read top-to-bottom in priority order, per the same
 * flash-on-change treatment (see useFlashHighlight) as the rest of the
 * board.
 */
const NextPatientCard = ({ next, hasCurrentPatient, doctorId, date, queueStatus }) => {
  const callMutation = useCallNextPatient();
  const isFlashing = useFlashHighlight(next?.tokenNumber);

  const canCall = !!next && !hasCurrentPatient && queueStatus === 'active';
  const timeSlot = formatTimeSlot(next?.appointment?.timeSlot);

  return (
    <Card
      className={isFlashing ? 'ring-2 ring-gold-300' : ''}
      style={{ backgroundColor: isFlashing ? '#FEF9EC' : undefined, transition: 'background-color 900ms ease-out' }}
    >
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-subtle">Next Patient</h2>

      {!next ? (
        <EmptyState title="Queue is empty" description="No patients are waiting right now." />
      ) : (
        <>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <p className="text-lg font-semibold text-ink">Token #{next.tokenNumber}</p>
            <p className="text-sm text-ink-muted">{next.patient?.fullName}</p>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-subtle">
            {timeSlot && <span>Appointment {timeSlot}</span>}
            {next.estimatedWaitingMinutes != null && <span>~{next.estimatedWaitingMinutes} min estimated wait</span>}
            {next.appointment?.status && <Badge status={next.appointment.status} />}
          </div>
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
