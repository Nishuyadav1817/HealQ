import { Link } from 'react-router-dom';
import Button from '../components/ui/PButton';
import Logo from '../../../components/common/Logo';
import { ROUTES } from '../../../constants/routePaths';

const HIGHLIGHTS = [
  {
    title: 'Find your hospital',
    description: 'Pick your city, browse nearby hospitals, and see every department at a glance.',
    icon: (
      <path d="M6 21V9l6-4 6 4v12M10 21v-6h4v6M9 12h.01M15 12h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    title: 'Book in a few taps',
    description: 'Choose a doctor, pick a date, and get an instant token number — no phone calls.',
    icon: (
      <path d="M8 3v3M16 3v3M4 9h16M5 6h14a1 1 0 011 1v12a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1zM9 14l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    title: 'Track your queue live',
    description: 'Watch your position and estimated wait time update in real time as your turn nears.',
    icon: (
      <path d="M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3.2 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
];

/** The "token card" mock in the hero is the same visual language used on
 * the real booking-confirmation and queue-tracking screens (see
 * BookingSuccessPage / AppointmentTrackPage) — a preview of the actual
 * product, not a generic stock illustration. */
const HomePage = () => (
  <div className="min-h-screen bg-surface">
    <header className="sticky top-0 z-40 border-b border-surface-border bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Logo size={34} />
        <div className="flex items-center gap-5">
          <Link to={ROUTES.LOGIN} className="text-sm font-medium text-ink-muted hover:text-primary-700">
            Log in
          </Link>
          <Link to={ROUTES.REGISTER}>
            <Button size="sm">Get started</Button>
          </Link>
        </div>
      </div>
    </header>

    <main>
      {/* Hero — soft radial brand wash behind the content, not a full
          gradient block, so the "expensive but restrained" rule holds. */}
      <div className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-x-0 -top-40 -z-10 h-[480px] bg-[radial-gradient(60%_60%_at_50%_0%,theme(colors.primary.100)_0%,transparent_70%)]"
          aria-hidden="true"
        />
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-700">
                <span className="h-1.5 w-1.5 rounded-full bg-gold-500" />
                No more waiting-room guesswork
              </span>
              <h1 className="mt-5 font-display text-4xl font-bold leading-[1.1] tracking-tight text-ink sm:text-5xl">
                Skip the waiting room queue.
              </h1>
              <p className="mt-4 max-w-lg text-lg leading-relaxed text-ink-muted">
                Book hospital appointments online and track your live position in the queue — no
                more guessing how long you'll be waiting.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to={ROUTES.REGISTER}>
                  <Button size="lg">Book an appointment</Button>
                </Link>
                <Link to={ROUTES.LOGIN}>
                  <Button size="lg" variant="secondary">
                    I already have an account
                  </Button>
                </Link>
              </div>
            </div>

            {/* Signature element: a live preview of the token card patients
                actually see after booking — grounds the hero in the real
                product instead of a generic illustration. */}
            <div className="relative mx-auto w-full max-w-sm">
              <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-primary-100/50 blur-3xl" aria-hidden="true" />
              <div className="rounded-xl border border-surface-border bg-white p-6 shadow-soft-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                    Your token
                  </span>
                  <span className="flex items-center gap-1.5 rounded-full bg-gold-50 px-2 py-0.5 text-xs font-semibold text-gold-700">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold-500" />
                    Live
                  </span>
                </div>
                <p className="mt-2 font-display text-5xl font-bold text-primary-700">#04</p>
                <div className="mt-5 space-y-2.5 border-t border-surface-border pt-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Doctor</span>
                    <span className="font-medium text-ink">Dr. Mukesh Kumar</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Patients ahead</span>
                    <span className="font-medium text-ink">3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Estimated wait</span>
                    <span className="font-medium text-ink">~16 min</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-4 sm:grid-cols-3">
          {HIGHLIGHTS.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-surface-border bg-white p-5 shadow-soft-sm transition-smooth hover:-translate-y-0.5 hover:shadow-soft"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                  {item.icon}
                </svg>
              </span>
              <p className="mt-3.5 font-display text-base font-bold text-ink">{item.title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </main>

    <footer className="border-t border-surface-border bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
        <Logo size={26} />
        <p className="text-xs text-ink-subtle">© {new Date().getFullYear()} UpcharGanga. All rights reserved.</p>
      </div>
    </footer>
  </div>
);

export default HomePage;
