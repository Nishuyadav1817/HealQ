import { Spinner, EmptyState, ErrorNotice } from './StateNotice';

/**
 * One table implementation for every admin list (Hospitals, Doctors,
 * Patients, Appointments, Reports). Callers supply `columns` (header +
 * a `render(row)` function per cell) and `rows` — everything about
 * loading/empty/error states and the responsive horizontal-scroll
 * wrapper lives here once instead of being re-implemented per page.
 * Purely presentational polish (sticky header, zebra rows, refined
 * hover) — the `columns`/`rows`/callback contract is unchanged, so no
 * caller needs to change.
 */
const DataTable = ({
  columns,
  rows,
  keyField = '_id',
  onRowClick,
  isLoading = false,
  isError = false,
  errorMessage,
  emptyTitle = 'Nothing here',
  emptyDescription = 'No records match your current filters.',
}) => {
  if (isLoading) return <Spinner label="Loading…" />;
  if (isError) return <ErrorNotice message={errorMessage} />;
  if (!rows || rows.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-surface-border bg-surface-card shadow-soft-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-surface-border bg-surface-muted">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="sticky top-0 whitespace-nowrap bg-surface-muted px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-ink-subtle"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {rows.map((row, idx) => (
              <tr
                key={row[keyField]}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`transition-smooth duration-100 ${idx % 2 === 1 ? 'bg-surface/60' : ''} ${
                  onRowClick ? 'cursor-pointer hover:bg-role-admin/5' : ''
                }`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="whitespace-nowrap px-4 py-3.5 text-ink">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
