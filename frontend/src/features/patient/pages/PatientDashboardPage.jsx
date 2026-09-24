import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useMyAppointments } from '../hooks/useAppointments';
import useAppointmentTracking from '../hooks/useAppointmentTracking';
import { EmptyState, ErrorNotice, CardSkeleton } from '../components/ui/PStateNotice';
import Button from '../components/ui/PButton';
import AppointmentCard from '../components/AppointmentCard';
import CurrentAppointmentHero from '../components/CurrentAppointmentHero';
import { ROUTES } from '../../../constants/routePaths';

const ACTIVE_QUEUE_STATUSES = ['checked-in', 'in-consultation'];
const UPCOMING_STATUSES = ['pending', 'confirmed', ...ACTIVE_QUEUE_STATUSES];
const HISTORY_STATUSES = ['completed', 'cancelled', 'no-show'];

/** Picks the single appointment the hero card should feature: whichever
 * one is actively in the queue right now (checked-in/in-consultation)
 * takes priority over one that's merely booked for later — that's the
 * one a patient most urgently wants to see their token/position for. */
const pickFeatured = (upcoming) => {
  const inQueue = upcoming.find((a) => ACTIVE_QUEUE_STATUSES.includes(a.status));
  if (inQueue) return inQueue;
  return [...upcoming].sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))[0];
};

const PatientDashboardPage = () => {
  const { user } = useAuth();
  const { data: appointments, isLoading, isError } = useMyAppointments({ limit: 10 });

  const upcoming = appointments?.filter((a) => UPCOMING_STATUSES.includes(a.status)) ?? [];
  const history = appointments?.filter((a) => HISTORY_STATUSES.includes(a.status)) ?? [];
  const featured = upcoming.length > 0 ? pickFeatured(upcoming) : null;
  const restOfUpcoming = upcoming.filter((a) => a._id !== featured?._id);

  const { live, isConnected } = useAppointmentTracking(featured?._id);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            Hi {user?.fullName?.split(' ')[0]},
          </h1>
          <p className="mt-1 text-sm text-ink-muted">Here's what's coming up for you.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to={ROUTES.PATIENT.CHOOSE_CITY}>
            <Button>Book a new appointment</Button>
          </Link>
          <Link to={ROUTES.PATIENT.APPOINTMENTS}>
            <Button variant="secondary">View all appointments</Button>
          </Link>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="mt-6 space-y-4">
          <CardSkeleton lines={4} />
          <CardSkeleton lines={2} />
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="mt-6">
          <ErrorNotice message="Couldn't load your appointments right now." />
        </div>
      )}

      {!isLoading && !isError && (
        <>
          {/* Featured current/next appointment — prioritized area of the
              page, per UpcharGanga's patient-dashboard spec. */}
          <div className="mt-6">
            {featured ? (
              <CurrentAppointmentHero appointment={featured} live={live} isConnected={isConnected} />
            ) : (
              <EmptyState
                title="No upcoming appointments"
                description="Book one to get a token number and live queue tracking."
                action={
                  <Link to={ROUTES.PATIENT.CHOOSE_CITY}>
                    <Button size="sm">Book an appointment</Button>
                  </Link>
                }
              />
            )}
          </div>

          {restOfUpcoming.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-subtle">
                Other upcoming appointments
              </h2>
              <div className="space-y-3">
                {restOfUpcoming.map((appointment) => (
                  <AppointmentCard key={appointment._id} appointment={appointment} />
                ))}
              </div>
            </section>
          )}

          {/* Previous appointments */}
          <section className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-subtle">
                Previous appointments
              </h2>
              {history.length > 0 && (
                <Link
                  to={ROUTES.PATIENT.APPOINTMENTS}
                  className="mb-3 text-xs font-medium text-primary-600 hover:text-primary-700"
                >
                  View all →
                </Link>
              )}
            </div>
            {history.length === 0 ? (
              <EmptyState
                icon="calendar"
                title="No past appointments yet"
                description="Completed and cancelled visits will show up here."
              />
            ) : (
              <div className="space-y-3">
                {history.slice(0, 3).map((appointment) => (
                  <AppointmentCard key={appointment._id} appointment={appointment} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default PatientDashboardPage;
