import { Link } from 'react-router-dom';
import Button from '../components/ui/PButton';
import Card from '../components/ui/PCard';
import HealQMark from '../components/ui/HealQMark';
import { ROUTES } from '../../../constants/routePaths';

const HIGHLIGHTS = [
  {
    title: 'Find your hospital',
    description: 'Pick your city, browse nearby hospitals, and see every department at a glance.',
  },
  {
    title: 'Book in a few taps',
    description: 'Choose a doctor, pick a date, and get an instant token number — no phone calls.',
  },
  {
    title: 'Track your queue live',
    description: 'Watch your position and estimated wait time update in real time as your turn nears.',
  },
];

/** The "token card" mock in the hero is the same visual language used on
 * the real booking-confirmation and queue-tracking screens (see
 * BookingSuccessPage / AppointmentTrackPage) — a preview of the actual
 * product, not a generic stock illustration. */
const HomePage = () => (
  <div className="min-h-screen bg-healq-50/40">
    <header className="border-b border-healq-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2.5">
          <HealQMark size={34} />
          <span className="font-serif text-lg font-semibold tracking-tight text-ink">HealQ</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to={ROUTES.LOGIN} className="text-sm font-medium text-ink-muted hover:text-healq-700">
            Log in
          </Link>
          <Link to={ROUTES.REGISTER}>
            <Button size="sm">Get started</Button>
          </Link>
        </div>
      </div>
    </header>

    <main className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <span className="inline-block rounded-full bg-healq-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-healq-700">
            No more waiting-room guesswork
          </span>
          <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
            Skip the waiting room queue.
          </h1>
          <p className="mt-4 max-w-lg text-lg text-ink-muted">
            Book hospital appointments online and track your live position in the queue — no more
            guessing how long you'll be waiting.
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
          <div className="absolute -inset-4 -z-10 rounded-3xl bg-healq-100/60 blur-2xl" aria-hidden="true" />
          <div className="rounded-2xl border border-healq-100 bg-white p-6 shadow-xl shadow-healq-900/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                Your token
              </span>
              <span className="flex items-center gap-1.5 text-xs font-medium text-healq-600">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-healq-600" />
                Live
              </span>
            </div>
            <p className="mt-2 font-serif text-5xl font-semibold text-healq-700">#04</p>
            <div className="mt-5 space-y-2.5 border-t border-healq-100 pt-4 text-sm">
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

      <div className="mt-20 grid gap-4 sm:grid-cols-3">
        {HIGHLIGHTS.map((item) => (
          <Card key={item.title}>
            <p className="font-serif text-lg font-semibold text-ink">{item.title}</p>
            <p className="mt-1.5 text-sm text-ink-muted">{item.description}</p>
          </Card>
        ))}
      </div>
    </main>
  </div>
);

export default HomePage;
