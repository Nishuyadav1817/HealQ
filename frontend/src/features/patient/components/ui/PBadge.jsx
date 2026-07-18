/**
 * HealQ's patient-facing status pill. Same API as components/ui/Badge
 * (status string in, colored pill out) — 'confirmed' now reads in HealQ
 * blue instead of the shared teal `role-patient` token, everything else
 * (success green, danger red) is unchanged since those carry universal
 * meaning across every panel.
 */
const STATUS_STYLES = {
  pending: 'bg-healq-50 text-ink-muted',
  confirmed: 'bg-healq-100 text-healq-700',
  'checked-in': 'bg-amber-100 text-amber-700',
  'in-consultation': 'bg-indigo-100 text-indigo-700',
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
      STATUS_STYLES[status] || 'bg-healq-50 text-ink-muted'
    }`}
  >
    {STATUS_LABELS[status] || status}
  </span>
);

export default Badge;
