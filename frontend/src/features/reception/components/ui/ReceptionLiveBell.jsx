/**
 * The header's "notifications" slot. There is no notifications backend
 * for reception (unlike the Patient panel's NotificationsBell, which is
 * backed by real toast events) — so rather than invent unread counts or
 * fake alerts, this shows the one real-time signal reception already
 * has: whether the board's live socket connection (see
 * useReceptionLiveUpdates) is currently streaming queue updates.
 * Honest about what it is, still gives the header its bell affordance.
 */
const ReceptionLiveBell = ({ isConnected }) => (
  <span
    className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted"
    title={isConnected ? 'Live queue updates connected' : 'Reconnecting — refreshing periodically'}
  >
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M6 8a6 6 0 1112 0c0 4 1.5 5.5 2 6H4c.5-.5 2-2 2-6z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M10 19a2 2 0 004 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
    <span
      className={`absolute right-1.5 top-1.5 h-2 w-2 rounded-full ring-2 ring-white ${
        isConnected ? 'animate-pulse bg-success' : 'bg-ink-subtle'
      }`}
    />
  </span>
);

export default ReceptionLiveBell;
