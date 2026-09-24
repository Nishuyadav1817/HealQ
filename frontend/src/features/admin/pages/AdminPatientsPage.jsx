import React from "react";
import { useMemo, useState } from 'react';
import Field from '../../../components/ui/Field';
import DataTable from '../../../components/ui/DataTable';
import Pagination from '../../../components/ui/Pagination';
import useDebouncedValue from '../../../hooks/useDebouncedValue';
import { useAdminPatients } from '../hooks/useAdminPatients';
import PatientDetailModal from '../components/PatientDetailModal';

const LIMIT = 10;

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

/**
 * Read-only by design — the backend admin module intentionally exposes
 * no patient-mutation endpoints (see admin.service.js). Deactivating a
 * patient account is a different, more sensitive operation than
 * deactivating a hospital/doctor and is left for a future dedicated flow
 * rather than being bolted on here.
 */
const AdminPatientsPage = () => {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const search = useDebouncedValue(searchInput, 400);
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  const params = useMemo(() => {
    const p = { page, limit: LIMIT };
    if (search) p.search = search;
    return p;
  }, [page, search]);

  const { data, isLoading, isError } = useAdminPatients(params);
  const patients = data?.patients ?? [];

  return (
    <div>
      <div>
        <h1 className="text-xl font-semibold text-ink">Patients</h1>
        <p className="mt-1 text-sm text-ink-muted">Every patient registered on the platform.</p>
      </div>

      <div className="mt-4">
        <Field
          className="w-full sm:w-72"
          placeholder="Search by name, email, or phone…"
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <div className="mt-4">
        <DataTable
          isLoading={isLoading}
          isError={isError}
          errorMessage="Couldn't load patients right now."
          rows={patients}
          onRowClick={(p) => setSelectedPatientId(p._id)}
          emptyTitle="No patients found"
          emptyDescription="Try a different search."
          columns={[
            { key: 'fullName', header: 'Name', render: (p) => p.fullName },
            { key: 'email', header: 'Email', render: (p) => p.email },
            { key: 'phone', header: 'Phone', render: (p) => p.phone },
            { key: 'city', header: 'City', render: (p) => p.address?.city?.name || '—' },
            { key: 'joined', header: 'Joined', render: (p) => formatDate(p.createdAt) },
            {
              key: 'status',
              header: 'Status',
              render: (p) => (
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                    p.isActive ? 'bg-success/10 text-success' : 'bg-surface text-ink-muted'
                  }`}
                >
                  {p.isActive ? 'Active' : 'Inactive'}
                </span>
              ),
            },
          ]}
        />
        {data && <Pagination page={data.page} limit={data.limit} total={data.total} onPageChange={setPage} />}
      </div>

      <PatientDetailModal
        isOpen={!!selectedPatientId}
        onClose={() => setSelectedPatientId(null)}
        patientId={selectedPatientId}
      />
    </div>
  );
};

export default AdminPatientsPage;
