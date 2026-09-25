import { useMemo, useState } from 'react';
import Field from '../../../components/ui/Field';
import Button from '../../../components/ui/Button';
import DataTable from '../../../components/ui/DataTable';
import Pagination from '../../../components/ui/Pagination';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import useDebouncedValue from '../../../hooks/useDebouncedValue';
import { useAdminHospitals } from '../hooks/useAdminHospitals';
import { useAdminStaff, useDeactivateStaff } from '../hooks/useAdminStaff';
import StaffFormModal from '../components/StaffFormModal';
import { getApiErrorMessage } from '../../../utils/apiError';

const LIMIT = 10;

const ROLE_LABELS = {
  receptionist: 'Receptionist',
  doctorAssistant: 'Doctor Assistant',
};

/**
 * Admin-only staff provisioning — Receptionists (scoped to one hospital)
 * and Doctor Assistants (scoped to one hospital AND one specific doctor).
 * Neither role can self-register (see PUBLIC_REGISTER_ROLES in
 * auth.validation.js) — this page + StaffFormModal + the /admin/staff
 * backend routes are the only way either account gets created.
 */
const AdminStaffPage = () => {
  const [page, setPage] = useState(1);
  const [hospitalFilter, setHospitalFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const search = useDebouncedValue(searchInput, 400);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState(null);

  const { data: hospitalsData } = useAdminHospitals({ limit: 100, isActive: 'true' });

  const params = useMemo(() => {
    const p = { page, limit: LIMIT };
    if (search) p.search = search;
    if (hospitalFilter) p.hospital = hospitalFilter;
    if (roleFilter) p.role = roleFilter;
    return p;
  }, [page, search, hospitalFilter, roleFilter]);

  const { data, isLoading, isError } = useAdminStaff(params);
  const deactivateMutation = useDeactivateStaff();

  const staff = data?.staff ?? [];

  const handleDeactivate = async () => {
    await deactivateMutation.mutateAsync(confirmDeactivate._id);
    setConfirmDeactivate(null);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink">Staff</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Receptionist and Doctor Assistant accounts. Both are provisioned here only — they can't
            self-register.
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>+ Add Staff Member</Button>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Field
          className="w-full sm:w-56"
          as="select"
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All roles</option>
          <option value="receptionist">Receptionist</option>
          <option value="doctorAssistant">Doctor Assistant</option>
        </Field>
        <Field
          className="w-full sm:w-64"
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
        <Field
          className="w-full sm:w-72"
          placeholder="Search by name or email…"
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
          errorMessage="Couldn't load staff right now."
          rows={staff}
          emptyTitle="No staff members found"
          emptyDescription="Try a different filter, or add the first one."
          columns={[
            { key: 'name', header: 'Name', render: (s) => s.fullName },
            { key: 'email', header: 'Email', render: (s) => s.email },
            { key: 'role', header: 'Role', render: (s) => ROLE_LABELS[s.role] || s.role },
            { key: 'hospital', header: 'Hospital', render: (s) => s.hospital?.name || '—' },
            {
              key: 'assignedDoctor',
              header: 'Assigned doctor',
              render: (s) =>
                s.role === 'doctorAssistant'
                  ? s.assignedDoctor
                    ? `Dr. ${s.assignedDoctor.user?.fullName} — ${s.assignedDoctor.specialization}`
                    : '—'
                  : 'N/A',
            },
            {
              key: 'status',
              header: 'Status',
              render: (s) => (
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                    s.isActive ? 'bg-success/10 text-success' : 'bg-surface text-ink-muted'
                  }`}
                >
                  {s.isActive ? 'Active' : 'Inactive'}
                </span>
              ),
            },
            {
              key: 'actions',
              header: '',
              render: (s) => (
                <div className="flex justify-end gap-2">
                  {s.isActive && (
                    <Button size="sm" variant="ghost" onClick={() => setConfirmDeactivate(s)}>
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

      <StaffFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        presetHospitalId={hospitalFilter}
      />

      {confirmDeactivate && (
        <ConfirmDialog
          title={`Deactivate ${confirmDeactivate.fullName}?`}
          description="They will no longer be able to log in. This can be reversed later from the database if needed."
          confirmLabel="Deactivate"
          isLoading={deactivateMutation.isPending}
          error={deactivateMutation.isError ? getApiErrorMessage(deactivateMutation.error) : null}
          onConfirm={handleDeactivate}
          onCancel={() => setConfirmDeactivate(null)}
        />
      )}
    </div>
  );
};

export default AdminStaffPage;
