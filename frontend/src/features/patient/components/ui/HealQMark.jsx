/**
 * The HealQ mark: a heartbeat pulse that resolves into a single filled
 * dot — "Heal" (the pulse line) meeting "Q" (the dot reads as a queue
 * token/position marker, the thing this whole app is actually about).
 * Used in the patient top nav, the auth screens, and the public
 * landing page — the three places the HealQ brand needs to appear.
 */
const HealQMark = ({ size = 36, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="healq-mark-grad" x1="0" y1="0" x2="40" y2="40">
        <stop offset="0" stopColor="#2563EB" />
        <stop offset="1" stopColor="#1E3A8A" />
      </linearGradient>
    </defs>
    <rect width="40" height="40" rx="11" fill="url(#healq-mark-grad)" />
    <path
      d="M7 21H13.5L16.5 12.5L20.5 27.5L24 16.5L26 21H29.5"
      stroke="white"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="30.5" cy="21" r="2.6" fill="white" />
  </svg>
);

export default HealQMark;
