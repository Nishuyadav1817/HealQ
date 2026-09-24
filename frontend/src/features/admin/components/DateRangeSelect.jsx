import React from "react";
const RANGE_OPTIONS = [
  { label: '7 days', value: 7 },
  { label: '14 days', value: 14 },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
];

/** Small pill group for picking how many trailing days of history to
 * aggregate — shared by the Analytics and Reports pages so both filter
 * the same way. */
const DateRangeSelect = ({ value, onChange }) => (
  <div className="flex gap-1.5">
    {RANGE_OPTIONS.map((opt) => (
      <button
        key={opt.value}
        type="button"
        onClick={() => onChange(opt.value)}
        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-smooth ${
          value === opt.value
            ? 'bg-role-admin text-white shadow-soft-sm'
            : 'bg-surface-muted text-ink-muted hover:bg-surface-border'
        }`}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

export default DateRangeSelect;
