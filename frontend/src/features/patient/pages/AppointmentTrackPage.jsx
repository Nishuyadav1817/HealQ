import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Badge from '../components/ui/PBadge';
import Button from '../components/ui/PButton';
import Card from '../components/ui/PCard';
import { Spinner, ErrorNotice } from '../components/ui/PStateNotice';
import { useAppointment, useCancelAppointment } from '../hooks/useAppointments';
import useAppointmentTracking from '../hooks/useAppointmentTracking';
import { ROUTES } from '../../../constants/routePaths';

const CANCELLABLE_STATUSES = ['pending', 'confirmed'];

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });

const AppointmentTrackPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: appointment, isLoading, isError } = useAppointment(id);
  const live = useAppointmentTracking(id);
  const cancelMutation = useCancelAppointment();
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelForm, setShowCancelForm] = useState(false);

  if (isLoading) return <Spinner label="Loading appointment…" />;
  if (isError || !appointment) {
    return (
      <ErrorNotice
        message="Couldn't load this appointment."
        action={
          <Link to={ROUTES.PATIENT.APPOINTMENTS} className="text-sm font-medium text-healq-600">
            Back to My Appointments →
          </Link>
        }
      />
    );
  }

  const canCancel = CANCELLABLE_STATUSES.includes(appointment.status);

  const handleCancel = async () => {
    await cancelMutation.mutateAsync({ id, reason: cancelReason });
    navigate(ROUTES.PATIENT.APPOINTMENTS);
  };

  return (
    <div className="max-w-xl">
      <Link to={ROUTES.PATIENT.APPOINTMENTS} className="text-sm font-medium text-ink-muted hover:text-healq-700">
        ← Back to My Appointments
      </Link>

      <div className="mt-3 flex items-center justify-between gap-3">
        <h1 className="font-serif text-2xl font-semibold text-ink">
          Dr. {appointment.doctor?.user?.fullName}
        </h1>
        <Badge status={live?.called ? 'in-consultation' : appointment.status} />
      </div>
      <p className="text-sm text-ink-muted">{appointment.hospital?.name}</p>
      {appointment.hospital?.address?.line1 && (
        <p className="text-xs text-ink-subtle">{appointment.hospital.address.line1}</p>
      )}

      {/* Signature element: same large token-number badge used on the
          booking-success screen and the landing-page hero preview. */}
      <div className="mt-4 flex flex-wrap items-center gap-4 rounded-2xl border border-healq-100 bg-healq-50/60 px-6 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">Your token</p>
          <p className="font-serif text-4xl font-semibold text-healq-700">#{appointment.tokenNumber}</p>
        </div>
        {live?.queuePosition != null && (
          <div className="border-l border-healq-200 pl-4">
            <p className="text-xs text-ink-subtle">Patients ahead</p>
            <p className="text-lg font-semibold text-ink">{Math.max(live.queuePosition - 1, 0)}</p>
          </div>
        )}
        {live?.estimatedWaitingMinutes != null && (
          <div className="border-l border-healq-200 pl-4">
            <p className="text-xs text-ink-subtle">Estimated wait</p>
            <p className="text-lg font-semibold text-ink">~{live.estimatedWaitingMinutes} min</p>
          </div>
        )}
      </div>

      <Card className="mt-4">
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-muted">Booking reference</dt>
            <dd className="font-medium text-ink">{appointment.bookingNumber}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-muted">Date</dt>
            <dd className="font-medium text-ink">{formatDate(appointment.appointmentDate)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-muted">Time slot</dt>
            <dd className="font-medium text-ink">
              {appointment.timeSlot?.start}–{appointment.timeSlot?.end}
            </dd>
          </div>
        </dl>
      </Card>

      {live?.called && (
        <div className="mt-4 rounded-xl border border-healq-600/30 bg-healq-50 p-4 text-sm font-medium text-healq-700">
          You're being called — please proceed to the consultation room now.
        </div>
      )}

      {appointment.status === 'cancelled' && appointment.cancellationReason && (
        <p className="mt-4 text-sm text-ink-muted">Cancellation reason: {appointment.cancellationReason}</p>
      )}

      {canCancel && (
        <div className="mt-6">
          {!showCancelForm ? (
            <Button variant="danger" size="sm" onClick={() => setShowCancelForm(true)}>
              Cancel appointment
            </Button>
          ) : (
            <div className="space-y-3 rounded-xl border border-healq-100 p-4">
              <p className="text-sm font-medium text-ink">Are you sure you want to cancel?</p>
              <textarea
                className="w-full rounded-lg border border-healq-200 p-2 text-sm focus:border-healq-600 focus:outline-none focus:ring-2 focus:ring-healq-100"
                placeholder="Reason (optional)"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
              <div className="flex gap-2">
                <Button variant="danger" size="sm" isLoading={cancelMutation.isPending} onClick={handleCancel}>
                  Confirm cancellation
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowCancelForm(false)}>
                  Keep appointment
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AppointmentTrackPage;
