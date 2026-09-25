import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useMyAppointments } from '../hooks/useAppointments';
import { Spinner, EmptyState, ErrorNotice } from '../components/ui/PStateNotice';
import Button from '../components/ui/PButton';
import AppointmentCard from '../components/AppointmentCard';
import { ROUTES } from '../../../constants/routePaths';

const UPCOMING_STATUSES = ['pending', 'confirmed', 'checked-in', 'in-consultation'];

const PatientDashboardPage = () => {
  const { user } = useAuth();
  const { data: appointments, isLoading, isError } = useMyAppointments({ limit: 5 });

  const upcoming = appointments?.filter((a) => UPCOMING_STATUSES.includes(a.status)) ?? [];

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-ink">
        Hi {user?.fullName?.split(' ')[0]},
      </h1>
      <p className="mt-1 text-sm text-ink-muted">Here's what's coming up for you.</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link to={ROUTES.PATIENT.CHOOSE_CITY}>
          <Button>Book a new appointment</Button>
        </Link>
        <Link to={ROUTES.PATIENT.APPOINTMENTS}>
          <Button variant="secondary">View all appointments</Button>
        </Link>
      </div>

      <h2 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wide text-ink-subtle">
        Upcoming
      </h2>

      {isLoading && <Spinner label="Loading your appointments…" />}
      {isError && <ErrorNotice message="Couldn't load your appointments right now." />}

      {!isLoading && !isError && upcoming.length === 0 && (
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

      {!isLoading && !isError && upcoming.length > 0 && (
        <div className="space-y-3">
          {upcoming.map((appointment) => (
            <AppointmentCard key={appointment._id} appointment={appointment} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientDashboardPage;
