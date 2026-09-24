/**
 * A small local icon set for the auth screens. The app has no icon
 * library dependency (see package.json), so these follow the same
 * pattern as components/common/Logo.jsx — plain inline SVG, sized via
 * `currentColor` so they inherit text color and work in any context
 * (input adornments, buttons, badges) without extra props.
 */
const base = 'h-[18px] w-[18px]';

export const MailIcon = ({ className = base }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="1.7" />
    <path d="M4 7.5l7.2 5.4a1.3 1.3 0 0 0 1.6 0L20 7.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const LockIcon = ({ className = base }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <rect x="4.5" y="10.5" width="15" height="9.5" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    <circle cx="12" cy="15" r="1.4" fill="currentColor" />
  </svg>
);

export const EyeIcon = ({ className = base }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="2.9" stroke="currentColor" strokeWidth="1.7" />
  </svg>
);

export const EyeOffIcon = ({ className = base }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M4 4l16 16M9.9 9.9a2.9 2.9 0 0 0 4.2 4.2M6.5 6.8C4 8.4 2.5 12 2.5 12s3.5 6.5 9.5 6.5c1.6 0 3-.4 4.2-1.1M11.2 5.6c.3 0 .5-.1.8-.1 6 0 9.5 6.5 9.5 6.5a15 15 0 0 1-2.8 3.6"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const UserIcon = ({ className = base }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <circle cx="12" cy="8.2" r="3.4" stroke="currentColor" strokeWidth="1.7" />
    <path d="M4.8 19.5c1.2-3.3 4-5 7.2-5s6 1.7 7.2 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);

export const PhoneIcon = ({ className = base }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M8.1 4.5H5.8a1.3 1.3 0 0 0-1.3 1.4c.4 4 2.1 7.7 4.9 10.5 2.8 2.8 6.5 4.5 10.5 4.9a1.3 1.3 0 0 0 1.4-1.3v-2.3a1.3 1.3 0 0 0-1-1.3l-3.4-.9a1.3 1.3 0 0 0-1.3.4l-1 1.2a11.6 11.6 0 0 1-5.3-5.3l1.2-1a1.3 1.3 0 0 0 .4-1.3l-.9-3.4a1.3 1.3 0 0 0-1.3-1Z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const CalendarIcon = ({ className = base }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <rect x="3.5" y="5" width="17" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
    <path d="M3.5 9.5h17M8 3v3.4M16 3v3.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);

export const ChevronDownIcon = ({ className = base }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M6 9.5l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const AlertIcon = ({ className = base }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
    <path d="M12 7.5v5.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    <circle cx="12" cy="16.3" r="1.05" fill="currentColor" />
  </svg>
);

export const CheckCircleIcon = ({ className = base }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
    <path d="M8 12.3l2.6 2.6L16.2 9" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const CheckSmallIcon = ({ className = 'h-3.5 w-3.5' }) => (
  <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
    <path d="M3 8.4l3.2 3.2L13 4.8" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
