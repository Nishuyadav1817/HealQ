import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Badge from '../components/ui/PBadge';
import Button from '../components/ui/PButton';
import Card from '../components/ui/PCard';
import PLiveIndicator from '../components/ui/PLiveIndicator';
import StatTile from '../components/StatTile';
import StatusTimeline from '../components/StatusTimeline';
import { Spinner, ErrorNotice } from '../components/ui/PStateNotice';
import { useAppointment, useCancelAppointment } from '../hooks/useAppointments';
import useAppointmentTracking from '../hooks/useAppointmentTracking';
import { ROUTES } from '../../../constants/routePaths';

const CANCELLABLE_STATUSES = ['pending', 'confirmed'];

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });

/**
 * The patient's live queue screen — same underlying Socket.IO mechanism
 * as before (useAppointmentTracking), presented as an obvious real-time
 * queue board: your token, the token currently being served, how many
 * people are ahead of you, and your estimated wait, alongside the
 * doctor/hospital/status context so a patient never has to guess which
 * appointment this is.
 */
const AppointmentTrackPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: appointment, isLoading, isError } = useAppointment(id);
  const { live, isConnected } = useAppointmentTracking(id);
  const cancelMutation = useCancelAppointment();
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelForm, setShowCancelForm] = useState(false);

  if (isLoading) return <Spinner label="Loading appointment…" />;
  if (isError || !appointment) {
    return (
      <ErrorNotice
        message="Couldn't load this appointment."
        action={
          <Link to={ROUTES.PATIENT.APPOINTMENTS} className="text-sm font-medium text-primary-600">
            Back to My Appointments →
          </Link>
        }
      />
    );
  }

  const canCancel = CANCELLABLE_STATUSES.includes(appointment.status);
  const status = live?.called ? 'in-consultation' : appointment.status;
  const peopleAhead = live?.queuePosition != null ? Math.max(live.queuePosition - 1, 0) : null;
  const nowServing =
    peopleAhead != null && appointment.tokenNumber != null
      ? Math.max(appointment.tokenNumber - peopleAhead, 1)
      : null;
  const isActiveQueue = ['pending', 'confirmed', 'checked-in', 'in-consultation'].includes(appointment.status);

  const handleCancel = async () => {
    await cancelMutation.mutateAsync({ id, reason: cancelReason });
    navigate(ROUTES.PATIENT.APPOINTMENTS);
  };

  return (
    <div className="max-w-2xl">
      <Link to={ROUTES.PATIENT.APPOINTMENTS} className="text-sm font-medium text-ink-muted hover:text-primary-700">
        ← Back to My Appointments
      </Link>

      {/* Who/where context — always visible so the patient knows exactly
          which hospital + doctor this queue view belongs to. */}
      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            Dr. {appointment.doctor?.user?.fullName}
          </h1>
          <p className="text-sm text-ink-muted">
            {appointment.hospital?.name}
            {appointment.department?.name ? ` · ${appointment.department.name}` : ''}
          </p>
          {appointment.hospital?.address?.line1 && (
            <p className="text-xs text-ink-subtle">{appointment.hospital.address.line1}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isActiveQueue && <PLiveIndicator isConnected={isConnected} />}
          <Badge status={status} />
        </div>
      </div>

      <div className="mt-4">
        <StatusTimeline status={status} />
      </div>

      {/* Queue board */}
      <div className="mt-5 rounded-2xl border border-primary-100 bg-primary-50/50 px-5 py-5 sm:px-6">
        <div className="grid grid-cols-2 gap-y-5 sm:grid-cols-4">
          <StatTile label="Your token" value={`#${appointment.tokenNumber}`} emphasize />
          <StatTile label="Now serving" value={nowServing != null ? `#${nowServing}` : '—'} tone="gold" />
          <StatTile label="Patients ahead" value={peopleAhead != null ? peopleAhead : '—'} />
          <StatTile
            label="Est. wait"
            value={live?.estimatedWaitingMinutes != null ? `${live.estimatedWaitingMinutes} min` : '—'}
          />
        </div>
      </div>

      {live?.called && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-gold-300 bg-gold-50 p-4 text-sm font-medium text-gold-700">
          <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-gold-500" />
          You're being called — please proceed to the consultation room now.
        </div>
      )}

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
            <div className="space-y-3 rounded-xl border border-primary-100 p-4">
              <p className="text-sm font-medium text-ink">Are you sure you want to cancel?</p>
              <textarea
                className="w-full rounded-lg border border-primary-200 p-2 text-sm focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-100"
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
