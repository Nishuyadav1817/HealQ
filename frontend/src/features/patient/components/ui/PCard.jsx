/**
 * HealQ's patient-facing Card. Same API as components/ui/Card
 * (children/onClick/selected/className/as) — softer rounded corners and
 * a faint blue-tinted border/shadow instead of the flat neutral
 * operational-panel look, since this is what a patient browses and
 * picks from, not a dense data table.
 */
const Card = ({ children, onClick, selected = false, className = '', as = 'div' }) => {
  const Tag = onClick ? 'button' : as;

  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`rounded-xl border bg-white p-5 text-left shadow-sm transition-all ${
        selected ? 'border-healq-600 ring-1 ring-healq-600' : 'border-healq-100'
      } ${onClick ? 'w-full cursor-pointer hover:-translate-y-0.5 hover:border-healq-500 hover:shadow-md' : ''} ${className}`}
    >
      {children}
    </Tag>
  );
};

export default Card;
