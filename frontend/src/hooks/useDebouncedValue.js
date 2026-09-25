import { useEffect, useState } from 'react';

/**
 * Delays reflecting `value` until it's stopped changing for `delayMs` —
 * used on every free-text search box in the app (Reception's booking
 * search, Admin's patient/appointment/hospital/doctor search) so a
 * request doesn't fire on every keystroke, only once typing pauses.
 * Promoted here from what used to be a copy-pasted local helper in
 * ReceptionDashboardPage so every feature shares one implementation.
 */
const useDebouncedValue = (value, delayMs = 400) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
};

export default useDebouncedValue;
