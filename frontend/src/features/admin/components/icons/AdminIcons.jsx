/**
 * One shared set of stroke icons for the Admin panel — sidebar nav,
 * header, and KPI cards all pull from here so the icon language stays
 * consistent (same stroke width, same 24x24 grid) instead of every
 * call site inlining its own one-off SVG.
 */
const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export const GridIcon = (p) => (
  <svg {...base} {...p}>
    <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
  </svg>
);

export const TrendIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M3.5 18.5l6-6.5 4 4 6.5-8" />
    <path d="M14.5 7.5h5.5v5.5" />
  </svg>
);

export const DocIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M6.5 3.5h8l4 4v13a1 1 0 01-1 1h-11a1 1 0 01-1-1v-16a1 1 0 011-1z" />
    <path d="M14 3.5v4a1 1 0 001 1h4" />
    <path d="M8.5 13h7M8.5 16.5h7" />
  </svg>
);

export const HospitalIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M4 21V6a1 1 0 011-1h5a1 1 0 011 1v15" />
    <path d="M14 21V10a1 1 0 011-1h4a1 1 0 011 1v11" />
    <path d="M4 21h16" />
    <path d="M7.5 8.5v.01M7.5 12v.01M7.5 15.5v.01" />
    <path d="M17 13v5M14.5 16h5" strokeWidth="1.6" />
  </svg>
);

export const DoctorIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M8 4v4a4 4 0 008 0V4" />
    <circle cx="18.5" cy="15" r="2" />
    <path d="M18.5 9v4" />
    <path d="M6 4v6a6 6 0 006 6v0c1 0 1.9-.2 2.7-.6" />
    <path d="M4.5 21c.6-3 2.7-4.5 5.5-4.5" />
  </svg>
);

export const PatientsIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3.5 20c.6-3.4 2.8-5.2 5.5-5.2s4.9 1.8 5.5 5.2" />
    <circle cx="17.5" cy="7.5" r="2.3" />
    <path d="M15.7 14.4c2.4.2 4.1 1.9 4.6 4.6" />
  </svg>
);

export const CalendarIcon = (p) => (
  <svg {...base} {...p}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
    <path d="M3.5 9.5h17" />
    <path d="M8 3v4M16 3v4" />
    <path d="M7.5 13.5h3M7.5 16.5h3M13.5 13.5h3" />
  </svg>
);

export const QueueIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M4 6h9" />
    <path d="M4 12h6" />
    <path d="M4 18h9" />
    <circle cx="18.5" cy="12" r="2.6" />
    <path d="M18.5 9.4V6M18.5 18v-3.4" strokeDasharray="2 2" />
  </svg>
);

export const RevenueIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M12 3.5v17" />
    <path d="M16.5 7c0-1.7-2-3-4.5-3s-4.5 1.4-4.5 3.2c0 4.5 9 2.4 9 6.8 0 1.9-2 3.5-4.5 3.5S7.5 16 7.5 14.3" />
  </svg>
);

export const DepartmentIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M12 3l8 4-8 4-8-4 8-4z" />
    <path d="M4 12l8 4 8-4" />
    <path d="M4 16l8 4 8-4" />
  </svg>
);

export const CityIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M4 21V9l5-3v15" />
    <path d="M15 21V4l5 3v14" />
    <path d="M9 21V13h6v8" />
    <path d="M6.5 12v.01M6.5 15.5v.01M17.5 9v.01M17.5 12v.01M17.5 15.5v.01" />
  </svg>
);

export const StaffIcon = (p) => (
  <svg {...base} {...p}>
    <rect x="4" y="4" width="16" height="16" rx="3" />
    <circle cx="12" cy="10.5" r="2.5" />
    <path d="M7.5 17c.9-2.4 2.4-3.5 4.5-3.5s3.6 1.1 4.5 3.5" />
  </svg>
);

export const SearchIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="M20 20l-4.5-4.5" />
  </svg>
);

export const LogoutIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M9 4H6a2 2 0 00-2 2v12a2 2 0 002 2h3" />
    <path d="M15 16l5-4-5-4" />
    <path d="M20 12H9" />
  </svg>
);

export const MenuIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

export const ChevronDownIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);
