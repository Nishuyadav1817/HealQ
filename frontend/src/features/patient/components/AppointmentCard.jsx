import { Link } from 'react-router-dom';
import Badge from './ui/PBadge';
import Card from './ui/PCard';
import { ROUTES } from '../../../constants/routePaths';

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });

const STATUS_ACCENT = {
  pending: 'bg-ink-subtle',
  confirmed: 'bg-primary-500',
  'checked-in': 'bg-gold-500',
  'in-consultation': 'bg-secondary-500',
  completed: 'bg-success',
  cancelled: 'bg-danger',
  'no-show': 'bg-danger',
};

const AppointmentCard = ({ appointment }) => (
  <Card as="div" className="!p-0 overflow-hidden">
    <div className="flex">
      <span className={`w-1.5 shrink-0 ${STATUS_ACCENT[appointment.status] || 'bg-primary-200'}`} aria-hidden="true" />
      <div className="flex-1 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-display text-base font-semibold text-ink">
              Dr. {appointment.doctor?.user?.fullName}
            </p>
            <p className="text-sm text-ink-muted">
              {appointment.hospital?.name}
              {appointment.department?.name ? ` · ${appointment.department.name}` : ''}
            </p>
            <p className="mt-1 text-xs text-ink-subtle">
              {formatDate(appointment.appointmentDate)} · {appointment.timeSlot?.start}–
              {appointment.timeSlot?.end} · Token #{appointment.tokenNumber}
            </p>
            <p className="mt-1 text-xs font-medium text-ink-subtle">{appointment.bookingNumber}</p>
          </div>
          <Badge status={appointment.status} />
        </div>
        <div className="mt-3">
          <Link
            to={`${ROUTES.PATIENT.APPOINTMENT_TRACK}/${appointment._id}`}
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            Track appointment →
          </Link>
        </div>
      </div>
    </div>
  </Card>
);

export default AppointmentCard;
