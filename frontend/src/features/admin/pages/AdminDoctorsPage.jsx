import React from "react";
import { useMemo, useState } from 'react';
import Field from '../../../components/ui/Field';
import Button from '../../../components/ui/Button';
import DataTable from '../../../components/ui/DataTable';
import Pagination from '../../../components/ui/Pagination';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import useDebouncedValue from '../../../hooks/useDebouncedValue';
import { useAdminDoctors, useDeleteDoctor } from '../hooks/useAdminDoctors';
import { useAdminHospitals } from '../hooks/useAdminHospitals';
import DoctorFormModal from '../components/DoctorFormModal';
import { getApiErrorMessage } from '../../../utils/apiError';

const LIMIT = 10;

const AdminDoctorsPage = () => {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const search = useDebouncedValue(searchInput, 400);
  const [hospitalFilter, setHospitalFilter] = useState('');
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState(null);

  const { data: hospitalsData } = useAdminHospitals({ limit: 100, isActive: 'true' });

  const params = useMemo(() => {
    const p = { page, limit: LIMIT };
    if (search) p.search = search;
    if (hospitalFilter) p.hospital = hospitalFilter;
    return p;
  }, [page, search, hospitalFilter]);

  const { data, isLoading, isError } = useAdminDoctors(params);
  const deleteMutation = useDeleteDoctor();

  const doctors = data?.doctors ?? [];

  const handleDeactivate = async () => {
    await deleteMutation.mutateAsync(confirmDeactivate._id);
    setConfirmDeactivate(null);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink">Doctors</h1>
          <p className="mt-1 text-sm text-ink-muted">Every doctor across every hospital.</p>
        </div>
        <Button onClick={() => setEditingDoctor({})}>+ New Doctor</Button>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Field
          className="w-full sm:w-72"
          placeholder="Search by specialization…"
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            setPage(1);
          }}
        />
        <Field
          className="w-full sm:w-56"
          as="select"
          value={hospitalFilter}
          onChange={(e) => {
            setHospitalFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All hospitals</option>
          {hospitalsData?.hospitals?.map((h) => (
            <option key={h._id} value={h._id}>
              {h.name}
            </option>
          ))}
        </Field>
      </div>

      <div className="mt-4">
        <DataTable
          isLoading={isLoading}
          isError={isError}
          errorMessage="Couldn't load doctors right now."
          rows={doctors}
          emptyTitle="No doctors found"
          emptyDescription="Try a different search or filter, or add the first doctor."
          columns={[
            { key: 'name', header: 'Name', render: (d) => `Dr. ${d.user?.fullName ?? '—'}` },
            { key: 'specialization', header: 'Specialization', render: (d) => d.specialization },
            { key: 'hospital', header: 'Hospital', render: (d) => d.hospital?.name || '—' },
            { key: 'department', header: 'Department', render: (d) => d.department?.name || '—' },
            { key: 'fee', header: 'Fee', render: (d) => `₹${d.consultationFee}` },
            {
              key: 'status',
              header: 'Status',
              render: (d) => (
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                    d.isActive ? 'bg-success/10 text-success' : 'bg-surface text-ink-muted'
                  }`}
                >
                  {d.isActive ? 'Active' : 'Inactive'}
                </span>
              ),
            },
            {
              key: 'actions',
              header: '',
              render: (d) => (
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="secondary" onClick={() => setEditingDoctor(d)}>
                    Edit
                  </Button>
                  {d.isActive && (
                    <Button size="sm" variant="ghost" onClick={() => setConfirmDeactivate(d)}>
                      Deactivate
                    </Button>
                  )}
                </div>
              ),
            },
          ]}
        />
        {data && <Pagination page={data.page} limit={data.limit} total={data.total} onPageChange={setPage} />}
      </div>

      <DoctorFormModal
        isOpen={!!editingDoctor}
        onClose={() => setEditingDoctor(null)}
        doctor={editingDoctor && Object.keys(editingDoctor).length ? editingDoctor : null}
      />

      {confirmDeactivate && (
        <ConfirmDialog
          title={`Deactivate Dr. ${confirmDeactivate.user?.fullName}?`}
          description="This also deactivates their login. Existing appointment history is kept."
          confirmLabel="Deactivate"
          isLoading={deleteMutation.isPending}
          error={deleteMutation.isError ? getApiErrorMessage(deleteMutation.error) : null}
          onConfirm={handleDeactivate}
          onCancel={() => setConfirmDeactivate(null)}
        />
      )}
    </div>
  );
};

export default AdminDoctorsPage;
