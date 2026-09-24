import { useMemo, useState } from 'react';
import Field from '../../../components/ui/Field';
import { Spinner, EmptyState, ErrorNotice } from '../../../components/ui/StateNotice';
import { useTodaysAppointments } from '../hooks/useTodaysAppointments';
import useReceptionLiveUpdates from '../hooks/useReceptionLiveUpdates';
import { useHospital } from '../hooks/useHospital';
import { useAuth } from '../../../context/AuthContext';
import useDebouncedValue from '../../../hooks/useDebouncedValue';
import StatsBar from '../components/StatsBar';
import StatusFilterTabs from '../components/StatusFilterTabs';
import LiveIndicator from '../components/LiveIndicator';
import ReceptionAppointmentCard from '../components/ReceptionAppointmentCard';
import DoctorQueueCard from '../components/DoctorQueueCard';
import groupByDoctor from '../utils/groupByDoctor';

/**
 * Reception's operations board. Two reads of the same
 * useTodaysAppointments hook/endpoint: an unfiltered one that powers the
 * always-current stats strip + per-doctor queue cards (so switching the
 * status filter below never distorts "how many are waiting right now"),
 * and a filtered one — identical to the previous single-query
 * implementation — that powers the searchable list. When no filter is
 * active both calls share the same query key, so React Query only ever
 * makes the one network request.
 */
const ReceptionDashboardPage = () => {
  const { user } = useAuth();
  const { data: hospital } = useHospital(user?.hospital);

  const [status, setStatus] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebouncedValue(searchInput, 400);

  const filters = useMemo(() => {
    const params = {};
    if (status) params.status = status;
    if (debouncedSearch) params.search = debouncedSearch;
    return params;
  }, [status, debouncedSearch]);

  const { data: allAppointments, isLoading: isLoadingAll, isError: isErrorAll } = useTodaysAppointments();
  const { data: filteredAppointments, isLoading, isError } = useTodaysAppointments(filters);

  const doctorIds = useMemo(
    () => (filteredAppointments ?? []).map((a) => a.doctor?._id || a.doctor).filter(Boolean),
    [filteredAppointments]
  );
  const { isConnected } = useReceptionLiveUpdates(doctorIds);

  const doctorQueues = useMemo(() => groupByDoctor(allAppointments ?? []), [allAppointments]);
  const isFiltering = !!status || !!debouncedSearch;
  const hospitalName = hospital?.name;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-role-reception">
            {hospitalName || 'Reception'}
          </p>
          <h1 className="mt-0.5 text-xl font-semibold text-ink">Today's Patients</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {hospitalName ? `Everyone booked at ${hospitalName} today.` : 'Everyone booked at your hospital today.'}
          </p>
        </div>
        <LiveIndicator isConnected={isConnected} />
      </div>

      {!isLoadingAll && !isErrorAll && <StatsBar appointments={allAppointments ?? []} />}

      {!isLoadingAll && !isErrorAll && doctorQueues.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-subtle">Doctor Queues</h2>
          <div className="mt-2.5 flex gap-3 overflow-x-auto pb-1">
            {doctorQueues.map((doctor) => (
              <DoctorQueueCard key={doctor.doctorId} doctor={doctor} />
            ))}
          </div>
        </div>
      )}

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
        {!isLoading && !isError && filteredAppointments?.length === 0 && (
          <EmptyState
            title="Nothing here"
            description={
              isFiltering
                ? 'No appointments match this filter yet.'
                : hospitalName
                ? `No appointments booked at ${hospitalName} today yet.`
                : 'No appointments booked today yet.'
            }
          />
        )}
        {!isLoading &&
          !isError &&
          filteredAppointments?.map((appointment) => (
            <ReceptionAppointmentCard key={appointment._id} appointment={appointment} />
          ))}
      </div>
    </div>
  );
};

export default ReceptionDashboardPage;
