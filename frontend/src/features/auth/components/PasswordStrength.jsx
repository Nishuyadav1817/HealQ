import { CheckSmallIcon } from './icons';

/**
 * Visual feedback for the password rule the backend already enforces
 * (8+ chars, upper, lower, number, symbol — see RegisterPage's static
 * hint text this replaces). Display-only: it never blocks submission,
 * the server remains the source of truth for whether the password is
 * accepted.
 */
const RULES = [
  { key: 'length', label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { key: 'upper', label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { key: 'lower', label: 'One lowercase letter', test: (p) => /[a-z]/.test(p) },
  { key: 'number', label: 'One number', test: (p) => /[0-9]/.test(p) },
  { key: 'symbol', label: 'One symbol', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

const STRENGTH_META = [
  { label: 'Very weak', color: 'bg-danger' },
  { label: 'Weak', color: 'bg-danger' },
  { label: 'Fair', color: 'bg-gold-500' },
  { label: 'Good', color: 'bg-secondary-500' },
  { label: 'Strong', color: 'bg-primary-600' },
];

const PasswordStrength = ({ password = '' }) => {
  if (!password) return null;

  const passed = RULES.filter((rule) => rule.test(password));
  const score = passed.length; // 0-5
  const meta = STRENGTH_META[Math.max(0, score - 1)] || STRENGTH_META[0];

  return (
    <div className="-mt-2.5 space-y-2.5">
      <div className="flex items-center gap-2.5">
        <div className="flex flex-1 gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i < score ? meta.color : 'bg-surface-muted'
              }`}
            />
          ))}
        </div>
        <span className="w-16 shrink-0 text-right text-xs font-medium text-ink-muted">{meta.label}</span>
      </div>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-1">
        {RULES.map((rule) => {
          const ok = rule.test(password);
          return (
            <li
              key={rule.key}
              className={`flex items-center gap-1.5 text-xs transition-colors ${
                ok ? 'text-primary-700' : 'text-ink-subtle'
              }`}
            >
              <span
                className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full ${
                  ok ? 'bg-primary-100 text-primary-700' : 'bg-surface-muted text-transparent'
                }`}
              >
                <CheckSmallIcon />
              </span>
              {rule.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default PasswordStrength;
