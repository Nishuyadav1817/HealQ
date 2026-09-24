import Modal from '../../../components/ui/Modal';
import Badge from '../../../components/ui/Badge';
import { Spinner, ErrorNotice, EmptyState } from '../../../components/ui/StateNotice';
import { useAdminPatientDetail } from '../hooks/useAdminPatients';

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const PatientDetailModal = ({ isOpen, onClose, patientId }) => {
  const { data, isLoading, isError } = useAdminPatientDetail(patientId);

  return (
    <Modal title="Patient Details" isOpen={isOpen} onClose={onClose} size="lg">
      {isLoading && <Spinner label="Loading patient…" />}
      {isError && <ErrorNotice message="Couldn't load this patient right now." />}

      {data && (
        <div className="space-y-5">
          <div>
            <p className="text-lg font-semibold text-ink">{data.patient.fullName}</p>
            <p className="text-sm text-ink-muted">{data.patient.email}</p>
            <p className="text-sm text-ink-muted">{data.patient.phone}</p>
            <p className="mt-1 text-xs text-ink-subtle">
              Joined {formatDate(data.patient.createdAt)}
              {data.patient.address?.city?.name && ` · ${data.patient.address.city.name}`}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-surface-border bg-surface-muted p-3">
              <p className="text-xl font-semibold text-ink">{data.stats.totalAppointments}</p>
              <p className="text-xs text-ink-muted">Total appointments</p>
            </div>
            <div className="rounded-lg border border-surface-border bg-surface-muted p-3">
              <p className="text-xl font-semibold text-ink">{data.stats.completedAppointments}</p>
              <p className="text-xs text-ink-muted">Completed</p>
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-ink">Recent Appointments</h3>
            {data.recentAppointments.length === 0 ? (
              <EmptyState title="No appointments yet" description="This patient hasn't booked anything." />
            ) : (
              <ul className="divide-y divide-surface-border rounded border border-surface-border">
                {data.recentAppointments.map((appt) => (
                  <li key={appt._id} className="flex items-center justify-between gap-3 px-3 py-2.5">
                    <div>
                      <p className="text-sm font-medium text-ink">
                        Dr. {appt.doctor?.user?.fullName} · {appt.hospital?.name}
                      </p>
                      <p className="text-xs text-ink-subtle">
                        {formatDate(appt.appointmentDate)} · {appt.bookingNumber}
                      </p>
                    </div>
                    <Badge status={appt.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default PatientDetailModal;
