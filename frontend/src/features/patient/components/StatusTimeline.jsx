const FLOW = [
  { key: 'pending', label: 'Booked' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'checked-in', label: 'Checked In' },
  { key: 'in-consultation', label: 'In Consultation' },
  { key: 'completed', label: 'Completed' },
];

/**
 * Maps the appointment's actual status onto the normal booking→completed
 * flow so a patient can see progress at a glance. Cancelled/no-show are
 * terminal, off-flow states and render as a single flagged step instead
 * of forcing them onto a progress bar that implies forward motion.
 */
const StatusTimeline = ({ status }) => {
  if (status === 'cancelled' || status === 'no-show') {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-danger/5 px-3 py-2 text-sm font-medium text-danger">
        <span className="h-2 w-2 rounded-full bg-danger" />
        {status === 'cancelled' ? 'This appointment was cancelled' : 'Marked as no-show'}
      </div>
    );
  }

  const currentIndex = Math.max(
    FLOW.findIndex((step) => step.key === status),
    0
  );

  return (
    <ol className="flex items-center">
      {FLOW.map((step, index) => {
        const isDone = index < currentIndex;
        const isActive = index === currentIndex;
        return (
          <li key={step.key} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white ring-4 ring-primary-100'
                    : isDone
                    ? 'bg-primary-500 text-white'
                    : 'border-2 border-primary-200 bg-white text-ink-subtle'
                }`}
              >
                {isDone ? '✓' : index + 1}
              </span>
              <span
                className={`whitespace-nowrap text-[11px] font-medium ${
                  isActive ? 'text-primary-700' : isDone ? 'text-ink-muted' : 'text-ink-subtle'
                }`}
              >
                {step.label}
              </span>
            </div>
            {index !== FLOW.length - 1 && (
              <span className={`mx-2 h-0.5 flex-1 rounded ${isDone ? 'bg-primary-500' : 'bg-primary-100'}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
};

export default StatusTimeline;
