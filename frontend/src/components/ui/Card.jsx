/**
 * Plain surface container reused for every card-like block: city/hospital/
 * doctor picker cards, appointment cards, form panels. `onClick` makes it
 * behave like a selectable option (hover/focus affordance included)
 * without duplicating those styles at every call site.
 */
const Card = ({ children, onClick, selected = false, className = '', as = 'div' }) => {
  const Tag = onClick ? 'button' : as;

  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`rounded border bg-surface-card p-4 text-left transition-colors ${
        selected ? 'border-brand-500 ring-1 ring-brand-500' : 'border-surface-border'
      } ${onClick ? 'w-full cursor-pointer hover:border-brand-500/60' : ''} ${className}`}
    >
      {children}
    </Tag>
  );
};

export default Card;
