/**
 * Shown while AuthContext's bootstrap refresh is in flight — prevents a
 * flash of the login screen for a user who actually has a valid session
 * cookie, and prevents a flash of protected content before we've
 * confirmed they don't.
 */
const FullScreenLoader = () => (
  <div className="flex h-screen w-screen items-center justify-center bg-surface">
    <div
      className="h-8 w-8 animate-spin rounded-full border-2 border-surface-border border-t-brand-500"
      role="status"
      aria-label="Loading"
    />
  </div>
);

export default FullScreenLoader;
