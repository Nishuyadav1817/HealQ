import { useMemo, useState } from 'react';
import Field from '../../../components/ui/Field';
import { Spinner, EmptyState, ErrorNotice } from '../../../components/ui/StateNotice';
import { useTodaysAppointments } from '../hooks/useTodaysAppointments';
import useReceptionLiveUpdates from '../hooks/useReceptionLiveUpdates';
import useDebouncedValue from '../../../hooks/useDebouncedValue';
import StatsBar from '../components/StatsBar';
import StatusFilterTabs from '../components/StatusFilterTabs';
import LiveIndicator from '../components/LiveIndicator';
import ReceptionAppointmentCard from '../components/ReceptionAppointmentCard';

const ReceptionDashboardPage = () => {
  const [status, setStatus] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebouncedValue(searchInput, 400);

  const filters = useMemo(() => {
    const params = {};
    if (status) params.status = status;
    if (debouncedSearch) params.search = debouncedSearch;
    return params;
  }, [status, debouncedSearch]);

  const { data: appointments, isLoading, isError } = useTodaysAppointments(filters);

  const doctorIds = useMemo(
    () => (appointments ?? []).map((a) => a.doctor?._id || a.doctor).filter(Boolean),
    [appointments]
  );
  const { isConnected } = useReceptionLiveUpdates(doctorIds);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink">Today's Patients</h1>
          <p className="mt-1 text-sm text-ink-muted">Everyone booked at your hospital today.</p>
        </div>
        <LiveIndicator isConnected={isConnected} />
      </div>

      {!isLoading && !isError && <StatsBar appointments={appointments ?? []} />}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <StatusFilterTabs value={status} onChange={setStatus} />
        <Field
          className="w-full sm:w-64"
          placeholder="Filter by booking number…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>

      <div className="mt-6 space-y-3">
        {isLoading && <Spinner label="Loading today's patients…" />}
        {isError && <ErrorNotice message="Couldn't load today's patients right now." />}
        {!isLoading && !isError && appointments?.length === 0 && (
          <EmptyState title="Nothing here" description="No appointments match this filter yet." />
        )}
        {!isLoading &&
          !isError &&
          appointments?.map((appointment) => (
            <ReceptionAppointmentCard key={appointment._id} appointment={appointment} />
          ))}
      </div>
    </div>
  );
};

export default ReceptionDashboardPage;
