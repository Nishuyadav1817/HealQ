/**
 * One "label over value" tile — used to lay out queue position,
 * estimated wait, department, etc. as a scannable grid instead of a
 * paragraph of prose. `emphasize` gives the token-number tile its
 * larger, brand-colored treatment.
 */
const StatTile = ({ label, value, emphasize = false, tone = 'default' }) => {
  const toneClasses =
    tone === 'gold'
      ? 'text-gold-700'
      : tone === 'danger'
      ? 'text-danger'
      : emphasize
      ? 'text-primary-700'
      : 'text-ink';

  return (
    <div className={emphasize ? '' : 'border-l border-primary-100 pl-4 first:border-l-0 first:pl-0'}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-subtle">{label}</p>
      <p
        className={`mt-0.5 font-display font-bold ${toneClasses} ${
          emphasize ? 'text-4xl sm:text-5xl' : 'text-lg'
        }`}
      >
        {value ?? '—'}
      </p>
    </div>
  );
};

export default StatTile;
