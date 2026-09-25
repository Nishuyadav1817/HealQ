import { useMemo, useState } from 'react';
import Field from '../../../components/ui/Field';
import Badge from '../../../components/ui/Badge';
import DataTable from '../../../components/ui/DataTable';
import Pagination from '../../../components/ui/Pagination';
import useDebouncedValue from '../../../hooks/useDebouncedValue';
import { useAdminAppointments } from '../hooks/useAdminAppointments';
import { useAdminHospitals } from '../hooks/useAdminHospitals';
import AppointmentDetailModal from '../components/AppointmentDetailModal';

const LIMIT = 10;

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'checked-in', label: 'Checked In' },
  { value: 'in-consultation', label: 'In Consultation' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'no-show', label: 'No Show' },
];

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

/**
 * Read-only, same reasoning as AdminPatientsPage — the backend admin
 * module exposes listing/detail only. Any status change (cancel, mark
 * no-show, etc.) already has a proper owner elsewhere (Reception's
 * useUpdateAppointmentStatus, Doctor Assistant's queue actions); this
 * tab is for oversight/search across every hospital, not for re-doing
 * those workflows here.
 */
const AdminAppointmentsPage = () => {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const search = useDebouncedValue(searchInput, 400);
  const [status, setStatus] = useState('');
  const [hospitalFilter, setHospitalFilter] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);

  const { data: hospitalsData } = useAdminHospitals({ limit: 100, isActive: 'true' });

  const params = useMemo(() => {
    const p = { page, limit: LIMIT };
    if (search) p.search = search;
    if (status) p.status = status;
    if (hospitalFilter) p.hospital = hospitalFilter;
    if (from) p.from = from;
    if (to) p.to = to;
    return p;
  }, [page, search, status, hospitalFilter, from, to]);

  const { data, isLoading, isError } = useAdminAppointments(params);
  const appointments = data?.appointments ?? [];

  const resetPage = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  return (
    <div>
      <div>
        <h1 className="text-xl font-semibold text-ink">Appointments</h1>
        <p className="mt-1 text-sm text-ink-muted">Every appointment across every hospital.</p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Field
          placeholder="Search by booking number…"
          value={searchInput}
          onChange={(e) => resetPage(setSearchInput)(e.target.value)}
        />
        <Field as="select" value={status} onChange={(e) => resetPage(setStatus)(e.target.value)}>
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Field>
        <Field
          as="select"
          value={hospitalFilter}
          onChange={(e) => resetPage(setHospitalFilter)(e.target.value)}
        >
          <option value="">All hospitals</option>
          {hospitalsData?.hospitals?.map((h) => (
            <option key={h._id} value={h._id}>
              {h.name}
            </option>
          ))}
        </Field>
        <Field type="date" value={from} onChange={(e) => resetPage(setFrom)(e.target.value)} />
        <Field type="date" value={to} onChange={(e) => resetPage(setTo)(e.target.value)} />
      </div>

      <div className="mt-4">
        <DataTable
          isLoading={isLoading}
          isError={isError}
          errorMessage="Couldn't load appointments right now."
          rows={appointments}
          onRowClick={(a) => setSelectedAppointmentId(a._id)}
          emptyTitle="No appointments found"
          emptyDescription="Try a different search, filter, or date range."
          columns={[
            { key: 'bookingNumber', header: 'Booking #', render: (a) => a.bookingNumber },
            { key: 'patient', header: 'Patient', render: (a) => a.patient?.fullName || '—' },
            { key: 'doctor', header: 'Doctor', render: (a) => `Dr. ${a.doctor?.user?.fullName ?? '—'}` },
            { key: 'hospital', header: 'Hospital', render: (a) => a.hospital?.name || '—' },
            { key: 'date', header: 'Date', render: (a) => formatDate(a.appointmentDate) },
            { key: 'status', header: 'Status', render: (a) => <Badge status={a.status} /> },
          ]}
        />
        {data && <Pagination page={data.page} limit={data.limit} total={data.total} onPageChange={setPage} />}
      </div>

      <AppointmentDetailModal
        isOpen={!!selectedAppointmentId}
        onClose={() => setSelectedAppointmentId(null)}
        appointmentId={selectedAppointmentId}
      />
    </div>
  );
};

export default AdminAppointmentsPage;
