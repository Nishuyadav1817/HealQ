import React from "react";
/**
 * One number-forward metric tile — hospitals count, revenue, appointments
 * today, etc. Reused across every Admin dashboard tab that needs a quick
 * headline figure, so the "big number + label + trend" pattern only
 * exists once in the codebase. `icon` and `tone` are optional — a card
 * with neither renders exactly as before.
 */
const TONES = {
  primary: 'bg-primary-50 text-primary-700',
  gold: 'bg-gold-50 text-gold-600',
  sky: 'bg-sky-50 text-sky-600',
  secondary: 'bg-secondary-50 text-secondary-600',
  admin: 'bg-role-admin/10 text-role-admin',
};

const StatCard = ({ label, value, trendPct = null, hint = null, icon: Icon = null, tone = 'admin' }) => {
  const isPositive = typeof trendPct === 'number' && trendPct > 0;
  const isNegative = typeof trendPct === 'number' && trendPct < 0;

  return (
    <div className="group rounded-lg border border-surface-border bg-surface-card p-4 shadow-soft-sm transition-smooth duration-150 hover:-translate-y-0.5 hover:shadow-soft">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-subtle">{label}</p>
        {Icon && (
          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${TONES[tone] || TONES.admin}`}>
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>
      <p className="mt-1.5 font-display text-2xl font-bold text-ink">{value}</p>
      <div className="mt-1.5 flex items-center gap-1.5">
        {trendPct !== null && (
          <span
            className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
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
