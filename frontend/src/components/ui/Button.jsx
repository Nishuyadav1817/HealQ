/**
 * Single reusable button used across every patient-facing screen. Variant
 * controls color/weight, `isLoading` swaps the label for an inline
 * spinner + disables the button so a slow request can never be
 * double-submitted by an impatient click.
 */
const VARIANTS = {
  primary: 'bg-brand-500 text-white hover:bg-brand-600 focus-visible:ring-brand-500',
  secondary:
    'bg-white text-ink border border-surface-border hover:bg-surface focus-visible:ring-brand-500',
  danger: 'bg-danger text-white hover:bg-danger/90 focus-visible:ring-danger',
  ghost: 'bg-transparent text-ink-muted hover:bg-surface hover:text-ink',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-base',
};

const Button = ({
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
    className={`inline-flex items-center justify-center gap-2 rounded font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
    {...rest}
  >
    {isLoading && (
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
    )}
    {children}
  </button>
);

export default Button;
