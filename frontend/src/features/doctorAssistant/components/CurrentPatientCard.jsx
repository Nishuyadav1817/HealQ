import React from "react";
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/StateNotice';
import { useStartConsultation, useCompleteConsultation, useSkipPatient } from '../hooks/useQueueActions';
import useFlashHighlight from '../hooks/useFlashHighlight';
import { formatTimeSlot, formatWaitingSince } from '../utils/format';

/**
 * `entry.status` is either 'called' (waiting to start) or
 * 'in-consultation' (see doctorAssistant.service.js getQueue —
 * currentPatient is whichever released entry has one of those two
 * statuses). The button shown follows that exact state machine:
 * called -> Start Consultation -> in-consultation -> Complete
 * Consultation -> done. Skip is only offered while still 'called',
 * matching QueueService.skipPatient's allowed transitions.
 *
 * The most prominent card on the board — this is who the doctor is
 * dealing with right now, so it's full-width and leads with a large
 * token number. A soft gold flash marks the moment a *different* token
 * lands here (see useFlashHighlight), purely as a visual cue on top of
 * data that already changed — it never affects the polling/Socket.IO
 * refetch that produced the change.
 */
const CurrentPatientCard = ({ entry }) => {
  const startMutation = useStartConsultation();
  const completeMutation = useCompleteConsultation();
  const skipMutation = useSkipPatient();

  const isFlashing = useFlashHighlight(entry?.tokenNumber);

  if (!entry) {
    return (
      <Card>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-subtle">Current Patient</h2>
        <EmptyState title="No one called yet" description="Call the next patient to bring them in." />
      </Card>
    );
  }

  const appointmentId = entry.appointment?._id || entry.appointment;
  const isCalled = entry.status === 'called';
  const isInConsultation = entry.status === 'in-consultation';
  const timeSlot = formatTimeSlot(entry.appointment?.timeSlot);
  const waitingFor = formatWaitingSince(entry.appointment?.arrivedAt);

  return (
    <Card
      className={`ring-1 ring-role-doctor/15 ${isFlashing ? 'ring-2 ring-gold-300' : ''}`}
      style={{ backgroundColor: isFlashing ? '#FEF9EC' : undefined, transition: 'background-color 900ms ease-out' }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-subtle">Current Patient</h2>
        <span className="rounded-full bg-role-doctor/10 px-2.5 py-1 text-xs font-semibold text-role-doctor">
          {isCalled ? 'Called — waiting to start' : 'In consultation'}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p className="font-display text-3xl font-bold tabular-nums text-role-doctor">#{entry.tokenNumber}</p>
        <p className="text-lg font-semibold text-ink">{entry.patient?.fullName}</p>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-subtle">
        {entry.patient?.phone && <span>{entry.patient.phone}</span>}
        {timeSlot && <span>Appointment {timeSlot}</span>}
        {entry.queuePosition != null && <span>Queue position {entry.queuePosition}</span>}
        {waitingFor && <span>Waiting {waitingFor}</span>}
        {entry.appointment?.status && <Badge status={entry.appointment.status} />}
      </div>

      {(entry.appointment?.reasonForVisit || entry.appointment?.symptoms?.length > 0) && (
        <div className="mt-3 rounded-lg border border-surface-border bg-surface-muted/60 p-3">
          {entry.appointment?.reasonForVisit && (
            <p className="text-sm text-ink">{entry.appointment.reasonForVisit}</p>
          )}
          {entry.appointment?.symptoms?.length > 0 && (
            <p className="mt-1 text-xs text-ink-subtle">Symptoms: {entry.appointment.symptoms.join(', ')}</p>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {isCalled && (
          <Button
            size="sm"
            isLoading={startMutation.isPending}
            onClick={() => startMutation.mutate({ appointmentId })}
          >
            Start Consultation
          </Button>
        )}
        {isInConsultation && (
          <Button
            size="sm"
            isLoading={completeMutation.isPending}
            onClick={() => completeMutation.mutate({ appointmentId })}
          >
            Complete Consultation
          </Button>
        )}
        {isCalled && (
          <Button
            size="sm"
            variant="ghost"
            isLoading={skipMutation.isPending}
            onClick={() => skipMutation.mutate({ appointmentId })}
          >
            Skip
          </Button>
        )}
      </div>
    </Card>
  );
};

export default CurrentPatientCard;
