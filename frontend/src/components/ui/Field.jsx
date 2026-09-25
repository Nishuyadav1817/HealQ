/**
 * One label+control+error wrapper reused for every form field in the
 * patient flow (register, login, booking form, profile edit). `as`
 * switches the rendered control between input/select/textarea while
 * keeping label/error/spacing identical everywhere.
 */
const baseControlClasses =
  'w-full rounded border border-surface-border bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-subtle focus:border-brand-500 focus:outline-none disabled:bg-surface disabled:text-ink-subtle';

const Field = ({ label, error, as = 'input', className = '', children, id, ...rest }) => {
  const Control = as;
  const controlId = id || rest.name;

  return (
    <label htmlFor={controlId} className={`block ${className}`}>
      {label && <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>}
      <Control
        id={controlId}
        className={`${baseControlClasses} ${as === 'textarea' ? 'min-h-[90px] resize-y' : ''} ${
          error ? 'border-danger' : ''
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
