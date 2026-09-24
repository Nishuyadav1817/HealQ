import React from "react";
/**
 * Decorative brand-panel illustration, purely visual (aria-hidden).
 * Composition, in one continuous idea: a few overlapping record cards
 * settle into a pulse line, which resolves into a queue trail of dots
 * that arrives at a filled, checked "you're seen" mark — the same
 * pulse-into-checkmark idea as the LogoMark, drawn out at panel scale
 * rather than a second, unrelated graphic.
 */
const AuthIllustration = ({ className = '' }) => (
  <svg viewBox="0 0 420 300" fill="none" className={className} aria-hidden="true">
    {/* Layered record cards */}
    <g opacity="0.9">
      <rect x="238" y="18" width="132" height="86" rx="14" stroke="white" strokeOpacity="0.16" strokeWidth="1.5" transform="rotate(6 238 18)" />
      <rect x="222" y="30" width="132" height="86" rx="14" stroke="white" strokeOpacity="0.28" strokeWidth="1.5" transform="rotate(-2 222 30)" />
      <rect x="228" y="34" width="132" height="86" rx="14" fill="white" fillOpacity="0.06" stroke="white" strokeOpacity="0.45" strokeWidth="1.5" />
      <circle cx="250" cy="56" r="6" fill="#F6D479" />
      <path d="M264 54h60M264 68h44M264 82h52" stroke="white" strokeOpacity="0.5" strokeWidth="2.4" strokeLinecap="round" />
    </g>

    {/* Pulse line running the width of the panel */}
    <path
      d="M14 178h44l14-34 20 62 18-96 16 68h30c6-14 18-22 30-22s22 10 26 22h208"
      stroke="white"
      strokeOpacity="0.85"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Queue trail resolving into a checked "you're seen" mark */}
    <g>
      <line x1="30" y1="236" x2="330" y2="236" stroke="white" strokeOpacity="0.18" strokeWidth="2" strokeDasharray="1 10" strokeLinecap="round" />
      <circle cx="30" cy="236" r="5" fill="white" fillOpacity="0.35" />
      <circle cx="96" cy="236" r="6.5" fill="white" fillOpacity="0.5" />
      <circle cx="168" cy="236" r="8" fill="white" fillOpacity="0.7" />
      <circle cx="248" cy="236" r="9.5" fill="#F6D479" fillOpacity="0.35" />
      <circle cx="330" cy="236" r="21" fill="#E8AC1E" />
      <path d="M320 236l7 7 14-15" stroke="#0F6440" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  </svg>
);

export default AuthIllustration;
