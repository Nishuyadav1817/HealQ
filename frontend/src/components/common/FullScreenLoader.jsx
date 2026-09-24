import { LogoMark } from './Logo';

/**
 * Shown while AuthContext's bootstrap refresh is in flight — prevents a
 * flash of the login screen for a user who actually has a valid session
 * cookie, and prevents a flash of protected content before we've
 * confirmed they don't. Uses the brand mark itself as the loading
 * indicator rather than a generic spinner, so even this transient
 * screen carries the identity.
 */
const FullScreenLoader = () => (
  <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-surface">
    <div className="animate-pulse" role="status" aria-label="Loading">
      <LogoMark size={44} />
    </div>
    <span className="h-1 w-24 overflow-hidden rounded-full bg-surface-muted">
      <span className="block h-full w-1/2 animate-[pulse_1.2s_ease-in-out_infinite] rounded-full bg-primary-500" />
    </span>
  </div>
);

export default FullScreenLoader;
