/**
 * Renders whichever of city/hospital/doctor have already been chosen
 * as small chips above the step content — keeps "which hospital am I
 * booking into" visible on every subsequent step instead of only on
 * the step where it was picked.
 */
const BookingContextBar = ({ items = [] }) => {
  const visible = items.filter((item) => item?.value);
  if (visible.length === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {visible.map((item, index) => (
        <span key={item.label} className="flex items-center gap-2">
          {index > 0 && <span className="text-primary-200">/</span>}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-white px-3 py-1 text-xs font-medium text-ink">
            <span className="text-ink-subtle">{item.label}:</span> {item.value}
          </span>
        </span>
      ))}
    </div>
  );
};

export default BookingContextBar;
