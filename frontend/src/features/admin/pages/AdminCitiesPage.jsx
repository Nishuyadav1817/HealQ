import React from "react";
import { useMemo, useState } from 'react';
import Field from '../../../components/ui/Field';
import Button from '../../../components/ui/Button';
import DataTable from '../../../components/ui/DataTable';
import Pagination from '../../../components/ui/Pagination';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import useDebouncedValue from '../../../hooks/useDebouncedValue';
import { useAdminCities, useDeleteCity } from '../hooks/useAdminCities';
import CityFormModal from '../components/CityFormModal';
import { getApiErrorMessage } from '../../../utils/apiError';

const LIMIT = 10;

const AdminCitiesPage = () => {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const search = useDebouncedValue(searchInput, 400);
  const [editingCity, setEditingCity] = useState(null); // null = closed, {} = create, {...} = edit
  const [confirmDeactivate, setConfirmDeactivate] = useState(null);

  const params = useMemo(() => {
    const p = { page, limit: LIMIT };
    if (search) p.search = search;
    return p;
  }, [page, search]);

  const { data, isLoading, isError } = useAdminCities(params);
  const deleteMutation = useDeleteCity();

  const cities = data?.cities ?? [];

  const handleDeactivate = async () => {
    await deleteMutation.mutateAsync(confirmDeactivate._id);
    setConfirmDeactivate(null);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink">Cities</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Cities the platform currently operates in. Added cities appear in the City dropdown
            when creating a hospital.
          </p>
        </div>
        <Button onClick={() => setEditingCity({})}>+ Add City</Button>
      </div>

      <div className="mt-4">
        <Field
          className="w-full sm:w-72"
          placeholder="Search by city name…"
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
          errorMessage="Couldn't load cities right now."
          rows={cities}
          emptyTitle="No cities found"
          emptyDescription="Try a different search, or add the first one."
          columns={[
            { key: 'name', header: 'Name', render: (c) => c.name },
            { key: 'state', header: 'State', render: (c) => c.state },
            { key: 'country', header: 'Country', render: (c) => c.country },
            {
              key: 'postalCodes',
              header: 'Postal codes',
              render: (c) => (c.postalCodes?.length ? c.postalCodes.join(', ') : '—'),
            },
            {
              key: 'status',
              header: 'Status',
              render: (c) => (
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                    c.isActive ? 'bg-success/10 text-success' : 'bg-surface text-ink-muted'
                  }`}
                >
                  {c.isActive ? 'Active' : 'Inactive'}
                </span>
              ),
            },
            {
              key: 'actions',
              header: '',
              render: (c) => (
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="secondary" onClick={() => setEditingCity(c)}>
                    Edit
                  </Button>
                  {c.isActive && (
                    <Button size="sm" variant="ghost" onClick={() => setConfirmDeactivate(c)}>
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

      <CityFormModal
        isOpen={!!editingCity}
        onClose={() => setEditingCity(null)}
        city={editingCity && Object.keys(editingCity).length ? editingCity : null}
      />

      {confirmDeactivate && (
        <ConfirmDialog
          title={`Deactivate ${confirmDeactivate.name}?`}
          description="It will no longer appear as an option when creating a hospital or when patients choose a city."
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

export default AdminCitiesPage;
