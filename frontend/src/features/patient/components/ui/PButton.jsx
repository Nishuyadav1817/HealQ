/**
 * HealQ's patient-facing Button. Same prop API as components/ui/Button
 * (so it's a drop-in swap at every call site) but styled from the
 * `healq-*` palette instead of `brand-*`, so this redesign stays
 * contained to the patient surface + auth screens — Admin, Reception,
 * and Doctor Assistant keep using the original Button untouched.
 */
const VARIANTS = {
  primary: 'bg-healq-600 text-white hover:bg-healq-700 focus-visible:ring-healq-600',
  secondary:
    'bg-white text-ink border border-healq-200 hover:bg-healq-50 focus-visible:ring-healq-600',
  danger: 'bg-danger text-white hover:bg-danger/90 focus-visible:ring-danger',
  ghost: 'bg-transparent text-ink-muted hover:bg-healq-50 hover:text-healq-700',
};

const SIZES = {
  sm: 'px-3.5 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

const PButton = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  type = 'button',
  className = '',
  ...rest
}) => (
  <button
    type={type}
    disabled={disabled || isLoading}
    className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
    {...rest}
  >
    {isLoading && (
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
    )}
    {children}
  </button>
);

export default PButton;
