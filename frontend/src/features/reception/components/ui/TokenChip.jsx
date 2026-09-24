/**
 * A patient's token number, rendered as a fixed-width numeric chip
 * rather than plain "#12" text — the one element reception staff scan
 * for first on a busy board, so it needs its own visual weight distinct
 * from names/status text around it.
 */
const SIZES = {
  sm: 'h-9 min-w-9 px-2 text-sm',
  md: 'h-11 min-w-11 px-2.5 text-base',
  lg: 'h-14 min-w-14 px-3 text-2xl',
};

const TONES = {
  default: 'border-role-reception/30 bg-role-reception/10 text-role-reception',
  active: 'border-role-doctor/30 bg-role-doctor/10 text-role-doctor',
  muted: 'border-surface-border bg-surface-muted text-ink-subtle',
};

const TokenChip = ({ value, size = 'md', tone = 'default', className = '' }) => (
  <span
    className={`inline-flex shrink-0 items-center justify-center rounded-xl border font-display font-bold tabular-nums ${SIZES[size]} ${TONES[tone]} ${className}`}
  >
    {value != null ? `#${value}` : '—'}
  </span>
);

export default TokenChip;
