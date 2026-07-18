import { useMemo, useState } from 'react';
import Field from '../../../components/ui/Field';
import Button from '../../../components/ui/Button';
import DataTable from '../../../components/ui/DataTable';
import Pagination from '../../../components/ui/Pagination';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import useDebouncedValue from '../../../hooks/useDebouncedValue';
import { useAdminHospitals } from '../hooks/useAdminHospitals';
import { useAdminDepartments, useDeleteDepartment } from '../hooks/useAdminDepartments';
import DepartmentFormModal from '../components/DepartmentFormModal';
import { getApiErrorMessage } from '../../../utils/apiError';

const LIMIT = 10;

const AdminDepartmentsPage = () => {
  const [page, setPage] = useState(1);
  const [hospitalFilter, setHospitalFilter] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const search = useDebouncedValue(searchInput, 400);
  const [editingDepartment, setEditingDepartment] = useState(null); // null = closed, {} = create, {...} = edit
  const [confirmDeactivate, setConfirmDeactivate] = useState(null);

  const { data: hospitalsData } = useAdminHospitals({ limit: 100, isActive: 'true' });

  const params = useMemo(() => {
    const p = { page, limit: LIMIT };
    if (search) p.search = search;
    if (hospitalFilter) p.hospital = hospitalFilter;
    return p;
  }, [page, search, hospitalFilter]);

  const { data, isLoading, isError } = useAdminDepartments(params);
  const deleteMutation = useDeleteDepartment();

  const departments = data?.departments ?? [];

  const handleDeactivate = async () => {
    await deleteMutation.mutateAsync(confirmDeactivate._id);
    setConfirmDeactivate(null);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink">Departments</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Departments (e.g. Cardiology, Orthopedics) that appear in the Department dropdown when
            adding a doctor. Each department belongs to one hospital.
          </p>
        </div>
        <Button onClick={() => setEditingDepartment({})}>+ Add Department</Button>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
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
          placeholder="Search by department name…"
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
          errorMessage="Couldn't load departments right now."
          rows={departments}
          emptyTitle="No departments found"
          emptyDescription="Try a different filter, or add the first one."
          columns={[
            { key: 'name', header: 'Name', render: (d) => d.name },
            { key: 'hospital', header: 'Hospital', render: (d) => d.hospital?.name || '—' },
            {
              key: 'slotDuration',
              header: 'Slot length',
              render: (d) => `${d.defaultSlotDurationMinutes} min`,
            },
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
                  <Button size="sm" variant="secondary" onClick={() => setEditingDepartment(d)}>
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

      <DepartmentFormModal
        isOpen={!!editingDepartment}
        onClose={() => setEditingDepartment(null)}
        department={
          editingDepartment && Object.keys(editingDepartment).length ? editingDepartment : null
        }
        presetHospitalId={hospitalFilter}
      />

      {confirmDeactivate && (
        <ConfirmDialog
          title={`Deactivate ${confirmDeactivate.name}?`}
          description="This also deactivates its doctors. Existing appointment history is kept."
          confirmLabel="Deactivate"
          isLoading={deleteMutation.isPending}
          error={
            deleteMutation.isError
              ? getApiErrorMessage(deleteMutation.error)
              : null
          }
          onConfirm={handleDeactivate}
          onCancel={() => setConfirmDeactivate(null)}
        />
      )}
    </div>
  );
};

export default AdminDepartmentsPage;
