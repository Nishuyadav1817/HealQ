import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import { EmptyState } from '../../../components/ui/StateNotice';
import { useStartConsultation, useCompleteConsultation, useSkipPatient } from '../hooks/useQueueActions';

/**
 * `entry.status` is either 'called' (waiting to start) or
 * 'in-consultation' (see doctorAssistant.service.js getQueue —
 * currentPatient is whichever released entry has one of those two
 * statuses). The button shown follows that exact state machine:
 * called -> Start Consultation -> in-consultation -> Complete
 * Consultation -> done. Skip is only offered while still 'called',
 * matching QueueService.skipPatient's allowed transitions.
 */
const CurrentPatientCard = ({ entry }) => {
  const startMutation = useStartConsultation();
  const completeMutation = useCompleteConsultation();
  const skipMutation = useSkipPatient();

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

  return (
    <Card>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-subtle">Current Patient</h2>
      <p className="text-lg font-semibold text-ink">Token #{entry.tokenNumber}</p>
      <p className="text-sm text-ink-muted">{entry.patient?.fullName}</p>
      {entry.patient?.phone && <p className="text-xs text-ink-subtle">{entry.patient.phone}</p>}
      {entry.appointment?.reasonForVisit && (
        <p className="mt-2 text-sm text-ink">{entry.appointment.reasonForVisit}</p>
      )}
      {entry.appointment?.symptoms?.length > 0 && (
        <p className="mt-1 text-xs text-ink-subtle">Symptoms: {entry.appointment.symptoms.join(', ')}</p>
      )}
      <p className="mt-2 text-xs font-medium text-role-doctor">
        {isCalled ? 'Called — waiting to start' : 'In consultation'}
      </p>

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
