import React from "react";
import { NavLink } from 'react-router-dom';
import { LogoMark } from '../../../components/common/Logo';

/**
 * Admin-only sidebar. Visually distinct from the shared DashboardShell
 * used by the other three roles (dark charcoal column, grouped sections,
 * per-item icons) but wired to the exact same nav targets — no route is
 * added or removed, only presented with more hierarchy.
 */
const AdminSidebar = ({ groups, onNavigate }) => (
  <>
    <div className="flex items-center gap-3 px-5 pb-6 pt-6">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
        <LogoMark size={24} />
      </span>
      <div className="leading-tight">
        <p className="font-display text-[15px] font-bold tracking-tight text-white">UpcharGanga</p>
        <p className="text-[10.5px] font-semibold uppercase tracking-wider text-white/45">
          Admin Console
        </p>
      </div>
    </div>

    <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="px-3 pb-1.5 text-[10.5px] font-bold uppercase tracking-wider text-white/35">
            {group.label}
          </p>
          <div className="space-y-0.5">
            {group.items.map(({ label, path, end, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                end={end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] font-medium transition-smooth duration-150 ${
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-white/60 hover:bg-white/[0.06] hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute -left-3 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-gold-500" />
                    )}
                    <Icon
                      className={`h-[17px] w-[17px] shrink-0 ${
                        isActive ? 'text-gold-500' : 'text-white/40 group-hover:text-white/70'
                      }`}
                    />
                    <span className="truncate">{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </nav>
  </>
);

export default AdminSidebar;
