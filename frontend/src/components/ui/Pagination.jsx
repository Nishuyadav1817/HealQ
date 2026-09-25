import Button from './Button';

/**
 * Page/limit control shared by every admin list (Hospitals, Doctors,
 * Patients, Appointments) — all of them consume the same
 * `{ page, limit }` shape from ApiFeatures.paginate() on the backend, so
 * one component covers all four instead of four bespoke pagers.
 */
const Pagination = ({ page, limit, total, onPageChange }) => {
  const totalPages = Math.max(Math.ceil(total / limit), 1);
  if (totalPages <= 1) return null;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs text-ink-subtle">
        Showing {from}–{to} of {total}
      </p>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="secondary"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <span className="text-xs font-medium text-ink-muted">
          Page {page} of {totalPages}
        </span>
        <Button
          size="sm"
          variant="secondary"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
