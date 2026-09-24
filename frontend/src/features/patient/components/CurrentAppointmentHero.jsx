import { Link } from 'react-router-dom';
import Badge from './ui/PBadge';
import PLiveIndicator from './ui/PLiveIndicator';
import StatTile from './StatTile';
import StatusTimeline from './StatusTimeline';
import { ROUTES } from '../../../constants/routePaths';

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'short' });

/**
 * The dashboard's centerpiece: hospital, doctor, department, date/time,
 * status, and — most prominently — the token number, plus live queue
 * position and estimated wait whenever useAppointmentTracking has a
 * socket payload for this appointment. Everything it renders is already
 * on the `appointment` object the dashboard fetches via useMyAppointments
 * / merged live data — no new data source.
 */
const CurrentAppointmentHero = ({ appointment, live, isConnected }) => {
  const status = live?.called ? 'in-consultation' : appointment.status;
  const peopleAhead = live?.queuePosition != null ? Math.max(live.queuePosition - 1, 0) : null;
  const nowServing =
    peopleAhead != null && appointment.tokenNumber != null
      ? Math.max(appointment.tokenNumber - peopleAhead, 1)
      : null;

  return (
    <div className="overflow-hidden rounded-2xl border border-primary-100 bg-white shadow-soft-md">
      {/* Context strip — hospital identity is the first thing a patient
          should register: "which hospital am I dealing with". */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-primary-600 px-5 py-3 text-white sm:px-6">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
              <path
                d="M6 21V9l6-4 6 4v12M10 21v-6h4v6M9 12h.01M15 12h.01"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{appointment.hospital?.name}</p>
            {appointment.hospital?.address?.line1 && (
              <p className="truncate text-xs text-white/75">{appointment.hospital.address.line1}</p>
            )}
          </div>
        </div>
        {live && <PLiveIndicator isConnected={isConnected !== false} />}
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">Your appointment</p>
            <p className="mt-1 font-display text-xl font-bold text-ink">
              Dr. {appointment.doctor?.user?.fullName}
            </p>
            <p className="text-sm text-ink-muted">
              {appointment.department?.name || appointment.doctor?.specialization}
            </p>
            <p className="mt-1 text-sm text-ink-muted">
              {formatDate(appointment.appointmentDate)} · {appointment.timeSlot?.start}–
              {appointment.timeSlot?.end}
            </p>
          </div>
          <Badge status={status} />
        </div>

        <div className="mt-5">
          <StatusTimeline status={status} />
        </div>

        {/* Signature element: the large token number, same treatment as
            booking-success and the tracking page — token is always the
            most visually dominant number on a patient screen. */}
        <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-primary-100 bg-primary-50/50 px-5 py-4 sm:grid-cols-4">
          <StatTile label="Your token" value={`#${appointment.tokenNumber}`} emphasize />
          <StatTile label="Now serving" value={nowServing != null ? `#${nowServing}` : '—'} tone="gold" />
          <StatTile label="Patients ahead" value={peopleAhead != null ? peopleAhead : '—'} />
          <StatTile
            label="Est. wait"
            value={live?.estimatedWaitingMinutes != null ? `${live.estimatedWaitingMinutes} min` : '—'}
          />
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link to={`${ROUTES.PATIENT.APPOINTMENT_TRACK}/${appointment._id}`}>
            <span className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700">
              Track live queue
            </span>
          </Link>
          <Link to={ROUTES.PATIENT.APPOINTMENTS}>
            <span className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary-200 bg-white px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-primary-50">
              All appointments
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CurrentAppointmentHero;
