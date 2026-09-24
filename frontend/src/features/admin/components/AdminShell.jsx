import React from "react";
import { useMemo, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

/**
 * Structural shell for the whole admin panel: a dark grouped sidebar
 * (static on md+, off-canvas drawer below it) plus a sticky header whose
 * title tracks the active route. `groups` is the same nav data AdminLayout
 * already owned — this just presents it with more hierarchy than the
 * shared DashboardShell gives every other role.
 */
const AdminShell = ({ groups }) => {
  const location = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const flatItems = useMemo(() => groups.flatMap((g) => g.items), [groups]);

  const activeItem = useMemo(() => {
    const path = location.pathname.replace(/\/+$/, '');
    return (
      flatItems.find((item) => (item.end ? item.path === path : path.startsWith(item.path))) ??
      flatItems[0]
    );
  }, [flatItems, location.pathname]);

  return (
    <div className="flex h-screen flex-col bg-surface md:flex-row">
      {isDrawerOpen && (
        <div
          className="fixed inset-0 z-30 bg-ink/50 md:hidden"
          onClick={() => setIsDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 -translate-x-full flex-col bg-role-admin transition-transform duration-200 ease-in-out md:static md:z-auto md:w-64 md:translate-x-0 ${
          isDrawerOpen ? 'translate-x-0' : ''
        }`}
      >
        <AdminSidebar groups={groups} onNavigate={() => setIsDrawerOpen(false)} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader
          title={activeItem?.label ?? 'Admin'}
          subtitle="Healthcare Queue & Appointment Platform"
          onOpenMenu={() => setIsDrawerOpen(true)}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminShell;
