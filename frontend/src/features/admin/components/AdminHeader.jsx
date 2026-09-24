import React from "react";
import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { LogoutIcon, MenuIcon, ChevronDownIcon } from './icons/AdminIcons';

/**
 * Top bar for every /admin/* screen — page title on the left (so the
 * admin always knows which section they're in even after scrolling
 * past the page's own <h1>), admin identity + logout on the right.
 * `onOpenMenu` is only wired up below md, where the sidebar becomes an
 * off-canvas drawer.
 */
const AdminHeader = ({ title, subtitle, onOpenMenu }) => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = (user?.fullName ?? 'A')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-surface-border bg-surface-card/95 px-4 py-3.5 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Open menu"
          className="rounded-lg p-1.5 text-ink-muted hover:bg-surface-muted md:hidden"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <h1 className="truncate font-display text-base font-bold tracking-tight text-ink sm:text-lg">
            {title}
          </h1>
          {subtitle && <p className="truncate text-xs text-ink-subtle">{subtitle}</p>}
        </div>
      </div>

      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2.5 rounded-full border border-surface-border py-1 pl-1 pr-2.5 transition-smooth hover:border-role-admin/30 hover:bg-surface-muted"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-role-admin text-[11px] font-bold text-white">
            {initials}
          </span>
          <span className="hidden text-left leading-tight sm:block">
            <span className="block max-w-[9rem] truncate text-xs font-semibold text-ink">
              {user?.fullName ?? 'Admin'}
            </span>
            <span className="block text-[10.5px] font-medium text-ink-subtle">Administrator</span>
          </span>
          <ChevronDownIcon className="hidden h-3.5 w-3.5 text-ink-subtle sm:block" />
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} aria-hidden="true" />
            <div className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-xl border border-surface-border bg-surface-card shadow-soft-lg">
              <div className="border-b border-surface-border px-3.5 py-3">
                <p className="truncate text-sm font-semibold text-ink">{user?.fullName ?? 'Admin'}</p>
                <p className="truncate text-xs text-ink-subtle">{user?.email ?? ''}</p>
              </div>
              <button
                type="button"
                onClick={logout}
                className="flex w-full items-center gap-2 px-3.5 py-2.5 text-sm font-medium text-danger transition-smooth hover:bg-danger/5"
              >
                <LogoutIcon className="h-4 w-4" />
                Log out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default AdminHeader;
