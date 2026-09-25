const STEPS = ['City', 'Hospital', 'Doctor', 'Confirm'];

/** `current` is 1-indexed (1 = City ... 4 = Confirm) so call sites read
 * naturally: <BookingSteps current={2} /> on the Choose Hospital page.
 * These numbered badges are HealQ's signature element, reused again for
 * the token number on the confirmation/tracking screens — this app is
 * fundamentally about a position in a sequence, so the numbering is
 * real information, not decoration. */
const BookingSteps = ({ current }) => (
  <ol className="mb-8 flex items-center gap-2 text-xs font-medium text-ink-subtle">
    {STEPS.map((step, index) => {
      const stepNumber = index + 1;
      const isDone = stepNumber < current;
      const isActive = stepNumber === current;
      return (
        <li key={step} className="flex items-center gap-2">
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
              isActive
                ? 'bg-healq-600 text-white'
                : isDone
                ? 'bg-healq-100 text-healq-700'
                : 'border border-healq-200 bg-white text-ink-subtle'
            }`}
          >
            {stepNumber}
          </span>
          <span className={isActive ? 'font-semibold text-ink' : ''}>{step}</span>
          {stepNumber !== STEPS.length && <span className="mx-1 h-px w-4 bg-healq-200" />}
        </li>
      );
    })}
  </ol>
);

export default BookingSteps;
