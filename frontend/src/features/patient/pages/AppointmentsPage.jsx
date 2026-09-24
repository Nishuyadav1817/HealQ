import { useState } from 'react';
import { Link } from 'react-router-dom';
import Field from '../components/ui/PField';
import Button from '../components/ui/PButton';
import { EmptyState, ErrorNotice, CardSkeleton } from '../components/ui/PStateNotice';
import { useMyAppointments } from '../hooks/useAppointments';
import AppointmentCard from '../components/AppointmentCard';
import { ROUTES } from '../../../constants/routePaths';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'checked-in', label: 'Checked In' },
  { value: 'in-consultation', label: 'In Consultation' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const AppointmentsPage = () => {
  const [status, setStatus] = useState('');
  const { data: appointments, isLoading, isError } = useMyAppointments(status ? { status } : {});

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">My Appointments</h1>
          <p className="mt-1 text-sm text-ink-muted">Track status and queue position for every booking.</p>
        </div>
        <Link to={ROUTES.PATIENT.CHOOSE_CITY}>
          <Button size="sm">Book new</Button>
        </Link>
      </div>

      <div className="mt-4 max-w-xs">
        <Field as="select" label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Field>
      </div>

      <div className="mt-6 space-y-3">
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} lines={3} />)}
        {isError && <ErrorNotice message="Couldn't load your appointments right now." />}
        {!isLoading && !isError && appointments?.length === 0 && (
          <EmptyState
            title="No appointments here"
            description="Nothing matches this filter yet."
          />
        )}
        {!isLoading &&
          !isError &&
          appointments?.map((appointment) => (
            <AppointmentCard key={appointment._id} appointment={appointment} />
          ))}
      </div>
    </div>
  );
};

export default AppointmentsPage;
