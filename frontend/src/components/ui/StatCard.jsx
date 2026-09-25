/**
 * One number-forward metric tile — hospitals count, revenue, appointments
 * today, etc. Reused across every Admin dashboard tab that needs a quick
 * headline figure, so the "big number + label + trend" pattern only
 * exists once in the codebase.
 */
const StatCard = ({ label, value, trendPct = null, hint = null }) => {
  const isPositive = typeof trendPct === 'number' && trendPct > 0;
  const isNegative = typeof trendPct === 'number' && trendPct < 0;

  return (
    <div className="rounded border border-surface-border bg-surface-card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-subtle">{label}</p>
      <p className="mt-1.5 text-2xl font-semibold text-ink">{value}</p>
      <div className="mt-1.5 flex items-center gap-1.5">
        {trendPct !== null && (
          <span
            className={`inline-flex items-center gap-0.5 text-xs font-medium ${
              isPositive ? 'text-success' : isNegative ? 'text-danger' : 'text-ink-subtle'
            }`}
          >
            {isPositive && '↑'}
            {isNegative && '↓'}
            {Math.abs(trendPct)}%
          </span>
        )}
        {hint && <span className="text-xs text-ink-subtle">{hint}</span>}
      </div>
    </div>
  );
};

export default StatCard;
