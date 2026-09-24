/**
 * One label+control+error wrapper reused for every form field across
 * the operational panels. `as` switches the rendered control between
 * input/select/textarea while keeping label/error/spacing identical
 * everywhere.
 */
const baseControlClasses =
  'w-full rounded-lg border border-surface-border bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-subtle transition-smooth duration-150 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 disabled:bg-surface-muted disabled:text-ink-subtle';

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
