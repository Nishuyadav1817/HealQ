import { ChevronDownIcon } from './icons';

/**
 * Auth-screen field: same label/error/as/...rest contract as
 * features/patient/components/ui/PField, plus an optional left `icon`
 * and an optional `rightSlot` (used for the password show/hide toggle).
 * Kept local to the auth feature — like PField/PButton before it — so
 * this pass stays contained to Login/Register and doesn't change the
 * shared Field used across the patient booking flow.
 */
const AuthField = ({
  label,
  icon: Icon,
  error,
  hint,
  as = 'input',
  className = '',
  id,
  rightSlot,
  children,
  ...rest
}) => {
  const Control = as;
  const controlId = id || rest.name;
  const isSelect = as === 'select';

  return (
    <div className={className}>
      {label && (
        <label htmlFor={controlId} className="mb-1.5 block text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-ink-subtle">
            <Icon />
          </span>
        )}
        <Control
          id={controlId}
          className={[
            'w-full rounded-lg border bg-white py-2.5 text-sm text-ink placeholder:text-ink-subtle transition-colors',
            'focus:outline-none focus:ring-2',
            error
              ? 'border-danger/60 focus:border-danger focus:ring-danger/10'
              : 'border-primary-200 focus:border-primary-600 focus:ring-primary-100',
            'disabled:bg-primary-50 disabled:text-ink-subtle',
            Icon ? 'pl-10' : 'pl-3.5',
            rightSlot ? 'pr-10' : isSelect ? 'pr-9' : 'pr-3.5',
            isSelect ? 'appearance-none' : '',
          ].join(' ')}
          {...rest}
        >
          {children}
        </Control>
        {rightSlot ? (
          <span className="absolute inset-y-0 right-0 flex items-center pr-2.5">{rightSlot}</span>
        ) : isSelect ? (
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-ink-subtle">
            <ChevronDownIcon className="h-4 w-4" />
          </span>
        ) : null}
      </div>
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-danger">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-ink-subtle">{hint}</p>
      ) : null}
    </div>
  );
};

export default AuthField;
