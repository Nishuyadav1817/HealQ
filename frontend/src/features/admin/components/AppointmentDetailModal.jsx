import Modal from '../../../components/ui/Modal';
import Badge from '../../../components/ui/Badge';
import { Spinner, ErrorNotice } from '../../../components/ui/StateNotice';
import { useAdminAppointmentDetail } from '../hooks/useAdminAppointments';

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

const AppointmentDetailModal = ({ isOpen, onClose, appointmentId }) => {
  const { data: appointment, isLoading, isError } = useAdminAppointmentDetail(appointmentId);

  return (
    <Modal title="Appointment Details" isOpen={isOpen} onClose={onClose} size="lg">
      {isLoading && <Spinner label="Loading appointment…" />}
      {isError && <ErrorNotice message="Couldn't load this appointment right now." />}

      {appointment && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-lg font-semibold text-ink">
                Token #{appointment.tokenNumber} · {appointment.bookingNumber}
              </p>
              <p className="text-sm text-ink-muted">
                {formatDate(appointment.appointmentDate)} · {appointment.timeSlot?.start}–
                {appointment.timeSlot?.end}
              </p>
            </div>
            <Badge status={appointment.status} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-surface-border bg-surface-muted p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">Patient</p>
              <p className="mt-1 text-sm font-medium text-ink">{appointment.patient?.fullName}</p>
              <p className="text-xs text-ink-subtle">{appointment.patient?.phone}</p>
              <p className="text-xs text-ink-subtle">{appointment.patient?.email}</p>
            </div>
            <div className="rounded-lg border border-surface-border bg-surface-muted p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">Doctor</p>
              <p className="mt-1 text-sm font-medium text-ink">Dr. {appointment.doctor?.user?.fullName}</p>
              <p className="text-xs text-ink-subtle">{appointment.doctor?.specialization}</p>
            </div>
            <div className="rounded-lg border border-surface-border bg-surface-muted p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">Hospital</p>
              <p className="mt-1 text-sm font-medium text-ink">{appointment.hospital?.name}</p>
            </div>
            <div className="rounded-lg border border-surface-border bg-surface-muted p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">Department</p>
              <p className="mt-1 text-sm font-medium text-ink">{appointment.department?.name}</p>
            </div>
          </div>

          {(appointment.reasonForVisit || appointment.symptoms?.length > 0) && (
            <div className="rounded-lg border border-surface-border bg-surface-muted p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">Visit details</p>
              {appointment.reasonForVisit && (
                <p className="mt-1 text-sm text-ink">{appointment.reasonForVisit}</p>
              )}
              {appointment.symptoms?.length > 0 && (
                <p className="mt-1 text-xs text-ink-subtle">Symptoms: {appointment.symptoms.join(', ')}</p>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-4 text-xs text-ink-subtle">
            <span>Consultation type: {appointment.consultationType}</span>
            <span>Verified: {appointment.verifiedAt ? formatDate(appointment.verifiedAt) : 'Not yet'}</span>
            <span>Arrived: {appointment.arrivedAt ? formatDate(appointment.arrivedAt) : 'Not yet'}</span>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default AppointmentDetailModal;
