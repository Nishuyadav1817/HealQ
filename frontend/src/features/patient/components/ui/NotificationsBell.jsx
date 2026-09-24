import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationsContext';
import { StateIcon } from './PStateNotice';
import { ROUTES } from '../../../../constants/routePaths';

const timeAgo = (iso) => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
};

const TONE_DOT = {
  urgent: 'bg-gold-500',
  success: 'bg-success',
  info: 'bg-primary-500',
};

const NotificationsBell = () => {
  const { items, unreadCount, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  const toggle = () => {
    setOpen((prev) => {
      const next = !prev;
      if (next) markAllRead();
      return next;
    });
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-label="Notifications"
        className="relative rounded-lg p-2 text-ink-muted transition-colors hover:bg-primary-50 hover:text-primary-700"
      >
        <StateIcon name="bell" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gold-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close notifications"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div
            ref={panelRef}
            className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-primary-100 bg-white shadow-soft-lg"
          >
            <div className="border-b border-primary-100 px-4 py-3">
              <p className="text-sm font-semibold text-ink">Notifications</p>
              <p className="text-xs text-ink-muted">Live updates about your appointments</p>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {items.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm text-ink-muted">You're all caught up.</p>
                  <p className="mt-1 text-xs text-ink-subtle">
                    We'll notify you here the moment your queue status changes.
                  </p>
                </div>
              ) : (
                <ul>
                  {items.map((item) => (
                    <li key={item.id} className="border-b border-surface-border px-4 py-3 last:border-b-0">
                      <div className="flex items-start gap-2.5">
                        <span
                          className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${TONE_DOT[item.tone] || TONE_DOT.info}`}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-ink">{item.title}</p>
                          {item.description && (
                            <p className="mt-0.5 text-xs text-ink-muted">{item.description}</p>
                          )}
                          <p className="mt-1 text-[11px] text-ink-subtle">{timeAgo(item.createdAt)}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="border-t border-primary-100 px-4 py-2.5">
              <Link
                to={ROUTES.PATIENT.APPOINTMENTS}
                onClick={() => setOpen(false)}
                className="text-xs font-medium text-primary-600 hover:text-primary-700"
              >
                View all appointments →
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationsBell;
