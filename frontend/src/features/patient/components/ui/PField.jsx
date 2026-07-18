/**
 * HealQ's patient-facing Field. Same API as components/ui/Field
 * (label/error/as/className/children/id/...rest) — blue focus ring
 * instead of the teal brand one used everywhere else.
 */
const baseControlClasses =
  'w-full rounded-lg border border-healq-200 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-subtle focus:border-healq-600 focus:outline-none focus:ring-2 focus:ring-healq-100 disabled:bg-healq-50 disabled:text-ink-subtle';

const Field = ({ label, error, as = 'input', className = '', children, id, ...rest }) => {
  const Control = as;
  const controlId = id || rest.name;

  return (
    <label htmlFor={controlId} className={`block ${className}`}>
      {label && <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>}
      <Control
        id={controlId}
        className={`${baseControlClasses} ${as === 'textarea' ? 'min-h-[90px] resize-y' : ''} ${
          error ? 'border-danger focus:border-danger focus:ring-danger/10' : ''
        }`}
        {...rest}
      >
        {children}
      </Control>
      {error && <span className="mt-1 block text-xs font-medium text-danger">{error}</span>}
    </label>
  );
};

export default Field;
