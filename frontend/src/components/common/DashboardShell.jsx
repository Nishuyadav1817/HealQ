import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Literal Tailwind class strings per role — NOT built dynamically (e.g.
 * `bg-role-${accent}`), because Tailwind's JIT compiler only picks up
 * class names it can see as complete strings in source. A dynamically
 * interpolated class name would work in dev and silently vanish from the
 * production build.
 */
const ACCENTS = {
  patient: { active: 'bg-role-patient/10 text-role-patient', dot: 'bg-role-patient', ring: 'ring-role-patient' },
  reception: { active: 'bg-role-reception/10 text-role-reception', dot: 'bg-role-reception', ring: 'ring-role-reception' },
  doctor: { active: 'bg-role-doctor/10 text-role-doctor', dot: 'bg-role-doctor', ring: 'ring-role-doctor' },
  admin: { active: 'bg-role-admin/10 text-role-admin', dot: 'bg-role-admin', ring: 'ring-role-admin' },
};

/**
 * The one structural shell every role's layout renders: a sidebar
 * (nav + role badge + logout) and a scrollable main content area that
 * renders the active route via <Outlet />. Individual layouts
 * (PatientLayout, ReceptionLayout, DoctorLayout, AdminLayout) supply
 * `navItems` and `accent` — everything else about the shell is shared,
 * so the four panels are structurally consistent while still visually
 * distinct (their one accent color).
 *
 * Responsive behavior: on md+ screens the sidebar is a static column,
 * always visible, exactly as before. Below md, it becomes an off-canvas
 * drawer — hidden by default, toggled by a hamburger button in a mobile
 * top bar, and closed automatically on navigation so tapping a nav link
 * on a phone doesn't also require dismissing the menu separately.
 */
const DashboardShell = ({ roleLabel, accent, navItems }) => {
  const { user, logout } = useAuth();
  const colors = ACCENTS[accent];
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const sidebarContent = (
    <>
      <div className="flex items-center gap-2 px-5 py-5">
        <span className={`h-2.5 w-2.5 rounded-full ${colors.dot}`} />
        <span className="text-sm font-semibold tracking-tight text-ink">HealQ</span>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map(({ label, path, end }) => (
          <NavLink
            key={path}
            to={path}
            end={end}
            onClick={() => setIsDrawerOpen(false)}
            className={({ isActive }) =>
              `block rounded px-3 py-2 text-sm font-medium transition-colors ${
                isActive ? colors.active : 'text-ink-muted hover:bg-surface hover:text-ink'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-surface-border px-4 py-4">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-subtle">{roleLabel}</p>
        <p className="mt-0.5 truncate text-sm font-medium text-ink">{user?.fullName ?? '—'}</p>
        <button
          type="button"
          onClick={logout}
          className="mt-3 w-full rounded border border-surface-border px-3 py-1.5 text-sm font-medium text-ink-muted transition-colors hover:border-ink hover:bg-ink hover:text-white"
        >
          Log out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen flex-col bg-surface md:flex-row">
      {/* Mobile top bar — hidden on md+, where the static sidebar takes over. */}
      <header className="flex items-center justify-between border-b border-surface-border bg-surface-card px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${colors.dot}`} />
          <span className="text-sm font-semibold tracking-tight text-ink">HealQ</span>
        </div>
        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          aria-label="Open menu"
          className="rounded p-1.5 text-ink-muted hover:bg-surface"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      {/* Backdrop — only rendered (and only intercepts clicks) while the
          mobile drawer is open. */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 z-30 bg-ink/40 md:hidden"
          onClick={() => setIsDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar — static column on md+; off-canvas drawer below md,
          slid in/out purely with a transform so it never affects layout. */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 -translate-x-full flex-col border-r border-surface-border bg-surface-card transition-transform duration-200 ease-in-out md:static md:z-auto md:w-64 md:translate-x-0 ${
          isDrawerOpen ? 'translate-x-0' : ''
        }`}
      >
        {sidebarContent}
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardShell;
