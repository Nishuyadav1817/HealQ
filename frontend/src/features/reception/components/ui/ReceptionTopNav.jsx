import { useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import { ROUTES } from '../../../../constants/routePaths';
import { LogoMark } from '../../../../components/common/Logo';
import { useHospital } from '../../hooks/useHospital';
import useSocketConnection from '../../hooks/useSocketConnection';
import ReceptionLiveBell from './ReceptionLiveBell';
import RAvatar from './RAvatar';

const NAV_ITEMS = [
  { label: 'Dashboard', path: ROUTES.RECEPTION.ROOT, end: true },
  { label: 'Search Booking', path: `${ROUTES.RECEPTION.ROOT}/search` },
];

/**
 * Two-tier identity in the header: UpcharGanga is always the platform mark;
 * the hospital name underneath it is pulled from the logged-in
 * receptionist's own account (`user.hospital`, resolved via
 * useHospital → GET /hospitals/:id — an endpoint that already exists
 * for the Patient panel's lookups) — never hard-coded, and simply
 * absent while it loads or if the account has no hospital assigned.
 */
const ReceptionTopNav = () => {
  const { user, logout } = useAuth();
  const { data: hospital } = useHospital(user?.hospital);
  const isConnected = useSocketConnection();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinkClasses = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive ? 'bg-role-reception/10 text-role-reception' : 'text-ink-muted hover:bg-surface-muted hover:text-ink'
    }`;

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-40 border-b border-surface-border bg-surface-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to={ROUTES.RECEPTION.ROOT} className="flex shrink-0 items-center gap-2.5">
            <LogoMark size={32} />
            <div className="leading-tight">
              <p className="font-display text-sm font-bold tracking-tight text-ink">
                Heal<span className="text-primary-600">Q</span>
              </p>
              <p className="max-w-[11rem] truncate text-[11px] font-semibold uppercase tracking-wide text-role-reception">
                {hospital?.name || 'Reception'}
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map(({ label, path, end }) => (
              <NavLink key={path} to={path} end={end} className={navLinkClasses}>
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <ReceptionLiveBell isConnected={isConnected} />
            <span className="mx-1 h-6 w-px bg-surface-border" aria-hidden="true" />
            <span className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2">
              <RAvatar name={user?.fullName} size="sm" />
              <span className="leading-tight">
                <span className="block max-w-[9rem] truncate text-sm font-medium text-ink">
                  {user?.fullName}
                </span>
                <span className="block text-[11px] text-ink-subtle">Reception</span>
              </span>
            </span>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-surface-border px-3 py-1.5 text-sm font-medium text-ink-muted transition-colors hover:border-ink hover:bg-ink hover:text-white"
            >
              Log out
            </button>
          </div>

          <div className="flex items-center gap-1 md:hidden">
            <ReceptionLiveBell isConnected={isConnected} />
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-label="Toggle menu"
              className="rounded-lg p-2 text-ink-muted hover:bg-surface-muted"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
                <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <nav className="border-t border-surface-border px-4 py-3 md:hidden">
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
            <div className="mt-3 flex items-center justify-between border-t border-surface-border pt-3">
              <span className="flex items-center gap-2 text-sm text-ink-muted">
                <RAvatar name={user?.fullName} size="sm" />
                {user?.fullName}
              </span>
              <button
                type="button"
                onClick={logout}
                className="rounded-lg border border-surface-border px-3 py-1.5 text-sm font-medium text-ink-muted hover:border-ink hover:bg-ink hover:text-white"
              >
                Log out
              </button>
            </div>
          </nav>
        )}
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default ReceptionTopNav;
