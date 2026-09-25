import { Spinner, EmptyState, ErrorNotice } from './StateNotice';

/**
 * One table implementation for every admin list (Hospitals, Doctors,
 * Patients, Appointments, Reports). Callers supply `columns` (header +
 * a `render(row)` function per cell) and `rows` — everything about
 * loading/empty/error states and the responsive horizontal-scroll
 * wrapper lives here once instead of being re-implemented per page.
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
    <div className="overflow-x-auto rounded border border-surface-border bg-surface-card">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-surface-border bg-surface">
            {columns.map((col) => (
              <th
                key={col.key}
                className="whitespace-nowrap px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-ink-subtle"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-border">
          {rows.map((row) => (
            <tr
              key={row[keyField]}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={onRowClick ? 'cursor-pointer hover:bg-surface' : undefined}
            >
              {columns.map((col) => (
                <td key={col.key} className="whitespace-nowrap px-4 py-3 text-ink">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
