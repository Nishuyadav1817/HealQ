import { Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routePaths';
import { LogoMark } from '../../../components/common/Logo';
import AuthIllustration from './AuthIllustration';

const REASSURANCES = ['Live queue tracking', 'Instant token numbers', 'No phone-call bookings'];

/**
 * The shared shell for Login/Register — a premium two-column product
 * screen rather than a form floating on white. Three responsive tiers:
 *
 *  - Desktop (lg+):  full brand panel — illustration, tagline, reassurance
 *                     list — beside a generously padded form card.
 *  - Tablet (md-lg):  a narrower brand panel keeps the identity and
 *                     tagline but drops the illustration/list, so it
 *                     doesn't feel like a cramped copy of the desktop one.
 *  - Mobile (<md):    the brand panel becomes a compact gradient banner
 *                     stacked above the form instead of disappearing.
 *
 * The gradient/illustration panel is the one deliberately bold moment in
 * the app (see tailwind.config.js) — everything around it, including the
 * form card, stays quiet and disciplined.
 */
const AuthLayout = ({ title, subtitle, eyebrow, footerText, footerLinkText, footerLinkTo, children }) => (
  <div className="flex min-h-screen flex-col bg-surface md:flex-row">
    {/* Mobile: compact brand banner, stacked above the form */}
    <div className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-secondary-700 px-6 pb-9 pt-7 text-white md:hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
        aria-hidden="true"
      />
      <div className="relative flex items-center justify-between">
        <Link to={ROUTES.HOME} className="flex items-center gap-2.5">
          <LogoMark size={30} />
          <span className="font-display text-base font-bold tracking-tight text-white">UpcharGanga</span>
        </Link>
        <div className="flex -space-x-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-2 w-2 rounded-full bg-white/40"
              style={{ opacity: 0.4 + i * 0.3 }}
            />
          ))}
        </div>
      </div>
      <p className="relative mt-5 max-w-xs font-display text-xl font-bold leading-snug tracking-tight">
        Hospital visits, without the guesswork.
      </p>
      <p className="relative mt-2 max-w-xs text-sm leading-relaxed text-primary-50/80">
        Book, track your queue position, and skip the waiting-room guesswork.
      </p>
    </div>

    {/* Tablet + desktop: full brand panel */}
    <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-secondary-700 px-9 py-10 text-white md:flex md:w-[36%] lg:w-[44%] lg:px-14 lg:py-12 xl:w-[42%]">
      {/* Soft depth blobs — the panel's one bold moment, kept quiet everywhere else */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-secondary-300/25 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-gold-500/20 blur-3xl" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
        aria-hidden="true"
      />

      <Link to={ROUTES.HOME} className="relative flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm">
          <LogoMark size={22} />
        </span>
        <span className="font-display text-lg font-bold tracking-tight text-white">UpcharGanga</span>
      </Link>

      <div className="relative">
        <p className="font-display text-3xl font-bold leading-tight tracking-tight lg:text-[2.3rem]">
          Hospital visits, without the guesswork.
        </p>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-primary-50/80">
          One platform for booking, live queue tracking, and clinic operations — built for real
          hospital workflows.
        </p>

        {/* Illustration + reassurance list: full richness at lg+, kept out at md so the
            tablet panel reads as "reduced", not a cramped copy of desktop. */}
        <div className="mt-8 hidden lg:block">
          <AuthIllustration className="h-auto w-full max-w-md" />
        </div>

        <ul className="mt-8 space-y-3">
          {REASSURANCES.map((item) => (
            <li key={item} className="flex items-center gap-2.5 text-sm font-medium text-primary-50/90">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15">
                <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3">
                  <path d="M3 8.5l3 3 7-7" stroke="#E8AC1E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <p className="relative text-xs text-primary-50/60">© {new Date().getFullYear()} UpcharGanga</p>
    </aside>

    {/* Form panel */}
    <main className="relative flex w-full flex-1 items-center justify-center overflow-hidden px-4 py-10 sm:px-6 md:py-12">
      <div
        className="pointer-events-none absolute -right-32 -top-32 hidden h-96 w-96 rounded-full bg-primary-100/60 blur-3xl md:block"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-24 hidden h-80 w-80 rounded-full bg-secondary-100/50 blur-3xl md:block"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md">
        {eyebrow && (
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
            {eyebrow}
          </span>
        )}
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink lg:text-[1.7rem]">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm text-ink-muted">{subtitle}</p>}

        <div className="mt-7 rounded-2xl border border-surface-border bg-surface-card p-6 shadow-soft-lg sm:p-7">
          {children}
        </div>

        <p className="mt-6 text-center text-sm text-ink-muted">
          {footerText}{' '}
          <Link to={footerLinkTo} className="font-semibold text-primary-600 hover:text-primary-700">
            {footerLinkText}
          </Link>
        </p>
      </div>
    </main>
  </div>
);

export default AuthLayout;
