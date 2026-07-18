import { Link } from 'react-router-dom';
import Badge from './ui/PBadge';
import Card from './ui/PCard';
import { ROUTES } from '../../../constants/routePaths';

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });

const AppointmentCard = ({ appointment }) => (
  <Card as="div">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="font-serif text-base font-semibold text-ink">
          Dr. {appointment.doctor?.user?.fullName}
        </p>
        <p className="text-sm text-ink-muted">{appointment.hospital?.name}</p>
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
        className="text-sm font-medium text-healq-600 hover:text-healq-700"
      >
        Track appointment →
      </Link>
    </div>
  </Card>
);

export default AppointmentCard;
