import { AlertIcon, CheckCircleIcon } from './icons';

const VARIANTS = {
  error: {
    wrap: 'border-danger/25 bg-danger/5 text-danger',
    icon: AlertIcon,
  },
  success: {
    wrap: 'border-primary-200 bg-primary-50 text-primary-700',
    icon: CheckCircleIcon,
  },
};

/**
 * Login's error state and the "account created" success state use the
 * same shape — an icon + message row — so they read as one system
 * rather than a red line of text vs. an ad-hoc green box.
 */
const AuthAlert = ({ variant = 'error', children }) => {
  const { wrap, icon: Icon } = VARIANTS[variant];
  return (
    <div className={`flex items-start gap-2.5 rounded-lg border px-3.5 py-2.5 text-sm font-medium ${wrap}`} role={variant === 'error' ? 'alert' : 'status'}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
};

export default AuthAlert;
