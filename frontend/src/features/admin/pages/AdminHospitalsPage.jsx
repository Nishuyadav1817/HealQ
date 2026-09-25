import { useMemo, useState } from 'react';
import Field from '../../../components/ui/Field';
import Button from '../../../components/ui/Button';
import DataTable from '../../../components/ui/DataTable';
import Pagination from '../../../components/ui/Pagination';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import useDebouncedValue from '../../../hooks/useDebouncedValue';
import { useAdminHospitals, useDeleteHospital } from '../hooks/useAdminHospitals';
import HospitalFormModal from '../components/HospitalFormModal';
import { getApiErrorMessage } from '../../../utils/apiError';

const LIMIT = 10;

const AdminHospitalsPage = () => {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const search = useDebouncedValue(searchInput, 400);
  const [editingHospital, setEditingHospital] = useState(null); // null = closed, {} = create, {...} = edit
  const [confirmDeactivate, setConfirmDeactivate] = useState(null);

  const params = useMemo(() => {
    const p = { page, limit: LIMIT };
    if (search) p.search = search;
    return p;
  }, [page, search]);

  const { data, isLoading, isError } = useAdminHospitals(params);
  const deleteMutation = useDeleteHospital();

  const hospitals = data?.hospitals ?? [];

  const handleDeactivate = async () => {
    await deleteMutation.mutateAsync(confirmDeactivate._id);
    setConfirmDeactivate(null);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink">Hospitals</h1>
          <p className="mt-1 text-sm text-ink-muted">Every hospital on the platform, active or not.</p>
        </div>
        <Button onClick={() => setEditingHospital({})}>+ New Hospital</Button>
      </div>

      <div className="mt-4">
        <Field
          className="w-full sm:w-72"
          placeholder="Search by hospital name…"
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
          errorMessage="Couldn't load hospitals right now."
          rows={hospitals}
          emptyTitle="No hospitals found"
          emptyDescription="Try a different search, or create the first one."
          columns={[
            { key: 'name', header: 'Name', render: (h) => h.name },
            { key: 'city', header: 'City', render: (h) => h.city?.name || '—' },
            { key: 'type', header: 'Type', render: (h) => h.type },
            { key: 'phone', header: 'Phone', render: (h) => h.contact?.phone || '—' },
            {
              key: 'status',
              header: 'Status',
              render: (h) => (
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                    h.isActive ? 'bg-success/10 text-success' : 'bg-surface text-ink-muted'
                  }`}
                >
                  {h.isActive ? 'Active' : 'Inactive'}
                </span>
              ),
            },
            {
              key: 'actions',
              header: '',
              render: (h) => (
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="secondary" onClick={() => setEditingHospital(h)}>
                    Edit
                  </Button>
                  {h.isActive && (
                    <Button size="sm" variant="ghost" onClick={() => setConfirmDeactivate(h)}>
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

      <HospitalFormModal
        isOpen={!!editingHospital}
        onClose={() => setEditingHospital(null)}
        hospital={editingHospital && Object.keys(editingHospital).length ? editingHospital : null}
      />

      {confirmDeactivate && (
        <ConfirmDialog
          title={`Deactivate ${confirmDeactivate.name}?`}
          description="This also deactivates its departments and doctors. Existing appointment history is kept."
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

export default AdminHospitalsPage;
