import { Link, useLocation, useParams } from 'react-router-dom';
import Button from '../components/ui/PButton';
import Card from '../components/ui/PCard';
import { Spinner, ErrorNotice } from '../components/ui/PStateNotice';
import { useAppointment } from '../hooks/useAppointments';
import { ROUTES } from '../../../constants/routePaths';

/** Reads the booking result out of navigation state (set right after
 * useBookAppointment succeeds) — falls back to a REST fetch if the page
 * was reloaded and that state was lost, so a refresh never breaks it. */
const BookingSuccessPage = () => {
  const { appointmentId } = useParams();
  const location = useLocation();
  const bookingResult = location.state;

  const shouldFetch = !bookingResult;
  const { data: fetchedAppointment, isLoading, isError } = useAppointment(shouldFetch ? appointmentId : null);

  const appointment = bookingResult?.appointment || fetchedAppointment;
  const bookingNumber = bookingResult?.bookingNumber || appointment?.bookingNumber;
  const queueNumber = bookingResult?.queueNumber ?? appointment?.tokenNumber;
  const queueStatus = bookingResult?.queueStatus;

  if (shouldFetch && isLoading) return <Spinner label="Loading your booking…" />;
  if (shouldFetch && (isError || !appointment)) {
    return <ErrorNotice message="Couldn't load this booking. Check My Appointments instead." />;
  }

  return (
    <div className="mx-auto max-w-lg text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-healq-100 text-2xl text-healq-700">
        ✓
      </div>
      <h1 className="mt-4 font-serif text-2xl font-semibold text-ink">Appointment booked!</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Dr. {appointment?.doctor?.user?.fullName} at {appointment?.hospital?.name}
      </p>
      {appointment?.hospital?.address?.line1 && (
        <p className="mt-0.5 text-xs text-ink-subtle">{appointment.hospital.address.line1}</p>
      )}
      {appointment?.hospital?.contact?.phone && (
        <p className="text-xs text-ink-subtle">Hospital contact: {appointment.hospital.contact.phone}</p>
      )}

      {/* Signature element: the same large token-number treatment used
          in the landing-page hero preview — this is the real one. */}
      <div className="mx-auto mt-6 w-fit rounded-2xl border border-healq-100 bg-healq-50/60 px-8 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">Your token</p>
        <p className="font-serif text-5xl font-semibold text-healq-700">#{queueNumber}</p>
      </div>

      <Card className="mt-6 text-left">
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-muted">Booking reference</dt>
            <dd className="font-medium text-ink">{bookingNumber}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-muted">Date</dt>
            <dd className="font-medium text-ink">
              {appointment && new Date(appointment.appointmentDate).toLocaleDateString(undefined, {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-muted">Time slot</dt>
            <dd className="font-medium text-ink">
              {appointment?.timeSlot?.start}–{appointment?.timeSlot?.end}
            </dd>
          </div>
          {queueStatus?.estimatedWaitingMinutes != null && (
            <div className="flex justify-between">
              <dt className="text-ink-muted">Estimated wait</dt>
              <dd className="font-medium text-ink">~{queueStatus.estimatedWaitingMinutes} min</dd>
            </div>
          )}
        </dl>
      </Card>

      <div className="mt-6 flex justify-center gap-3">
        <Link to={`${ROUTES.PATIENT.APPOINTMENT_TRACK}/${appointment?._id}`}>
          <Button>Track this appointment</Button>
        </Link>
        <Link to={ROUTES.PATIENT.ROOT}>
          <Button variant="secondary">Back to dashboard</Button>
        </Link>
      </div>
    </div>
  );
};

export default BookingSuccessPage;
