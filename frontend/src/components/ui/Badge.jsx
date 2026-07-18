/**
 * Small pill used to render an appointment/queue status. Colors are
 * looked up by the raw backend status string (see constants/enums on the
 * backend — kept in sync manually the same way roles.js is) so callers
 * never have to know the color mapping themselves.
 */
const STATUS_STYLES = {
  pending: 'bg-surface text-ink-muted',
  confirmed: 'bg-role-patient/10 text-role-patient',
  'checked-in': 'bg-role-reception/10 text-role-reception',
  'in-consultation': 'bg-role-doctor/10 text-role-doctor',
  completed: 'bg-success/10 text-success',
  cancelled: 'bg-danger/10 text-danger',
  'no-show': 'bg-danger/10 text-danger',
};

const STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  'checked-in': 'Checked In',
  'in-consultation': 'In Consultation',
  completed: 'Completed',
  cancelled: 'Cancelled',
  'no-show': 'No Show',
};

const Badge = ({ status }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
      STATUS_STYLES[status] || 'bg-surface text-ink-muted'
    }`}
  >
    {STATUS_LABELS[status] || status}
  </span>
);

export default Badge;
