import React from "react";
/**
 * Single reusable button used across every operational-panel screen.
 * Variant controls color/weight, `isLoading` swaps the label for an
 * inline spinner + disables the button so a slow request can never be
 * double-submitted by an impatient click.
 */
const VARIANTS = {
  primary:
    'bg-primary-600 text-white shadow-soft-sm hover:bg-primary-700 focus-visible:ring-primary-500',
  secondary:
    'bg-white text-ink border border-surface-border hover:border-ink/20 hover:bg-surface-muted focus-visible:ring-primary-500',
  danger: 'bg-danger text-white shadow-soft-sm hover:bg-danger/90 focus-visible:ring-danger',
  ghost: 'bg-transparent text-ink-muted hover:bg-surface-muted hover:text-ink',
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
    className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-smooth duration-150 disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
    {...rest}
  >
    {isLoading && (
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
    )}
    {children}
  </button>
);

export default Button;
