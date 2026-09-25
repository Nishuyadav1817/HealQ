import { useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import { ROUTES } from '../../../../constants/routePaths';
import HealQMark from './HealQMark';

/**
 * HealQ's patient-facing shell — a classic horizontal top nav (the
 * familiar shape of a patient portal — MyChart, insurer sites, etc.)
 * rather than the sidebar-dashboard chrome the operational panels
 * (Reception/Doctor Assistant/Admin) use, since a patient is browsing
 * and booking, not monitoring a live operations board. Those three
 * panels keep DashboardShell untouched; this is a dedicated component
 * used only by PatientLayout.
 */
const NAV_ITEMS = [
  { label: 'Dashboard', path: ROUTES.PATIENT.ROOT, end: true },
  { label: 'Book Appointment', path: ROUTES.PATIENT.CHOOSE_CITY },
  { label: 'My Appointments', path: ROUTES.PATIENT.APPOINTMENTS },
  { label: 'Profile', path: ROUTES.PATIENT.PROFILE },
];

const PatientTopNav = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinkClasses = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive ? 'bg-healq-50 text-healq-700' : 'text-ink-muted hover:bg-healq-50 hover:text-healq-700'
    }`;

  return (
    <div className="min-h-screen bg-healq-50/40">
      <header className="sticky top-0 z-40 border-b border-healq-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to={ROUTES.PATIENT.ROOT} className="flex items-center gap-2.5">
            <HealQMark size={34} />
            <span className="font-serif text-lg font-semibold tracking-tight text-ink">HealQ</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map(({ label, path, end }) => (
              <NavLink key={path} to={path} end={end} className={navLinkClasses}>
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <span className="text-sm text-ink-muted">{user?.fullName}</span>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-healq-200 px-3 py-1.5 text-sm font-medium text-ink-muted transition-colors hover:border-healq-600 hover:text-healq-700"
            >
              Log out
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
            className="rounded-lg p-2 text-ink-muted hover:bg-healq-50 md:hidden"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {isMenuOpen && (
          <nav className="border-t border-healq-100 px-4 py-3 md:hidden">
            <div className="flex flex-col gap-1">
              {NAV_ITEMS.map(({ label, path, end }) => (
                <NavLink
                  key={path}
                  to={path}
                  end={end}
                  onClick={() => setIsMenuOpen(false)}
                  className={navLinkClasses}
                >
                  {label}
                </NavLink>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-healq-100 pt-3">
              <span className="text-sm text-ink-muted">{user?.fullName}</span>
              <button
                type="button"
                onClick={logout}
                className="rounded-lg border border-healq-200 px-3 py-1.5 text-sm font-medium text-ink-muted hover:border-healq-600 hover:text-healq-700"
              >
                Log out
              </button>
            </div>
          </nav>
        )}
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
};

export default PatientTopNav;
