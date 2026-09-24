import { useEffect, useRef, useState } from 'react';

/**
 * Returns true for a short window right after `value` changes, then
 * false again — a purely presentational signal, not a data source. Used
 * to give the queue board a subtle visual pulse whenever a token number
 * changes (a new current patient, a new "next" patient, a queue entry
 * moving) without touching how that data actually arrives: whatever
 * triggered the change (the Socket.IO-driven refetch in
 * useQueueLiveUpdates, or the 15s polling fallback in useQueue) is
 * untouched — this hook only reacts to the value it's given, after the
 * fact. Does nothing on first mount, so loading the board for the first
 * time never flashes every card at once.
 */
const useFlashHighlight = (value, duration = 1400) => {
  const [isFlashing, setIsFlashing] = useState(false);
  const prevRef = useRef(value);

  useEffect(() => {
    if (value !== prevRef.current) {
      prevRef.current = value;
      if (value !== undefined && value !== null) {
        setIsFlashing(true);
        const timer = setTimeout(() => setIsFlashing(false), duration);
        return () => clearTimeout(timer);
      }
    }
    return undefined;
  }, [value, duration]);

  return isFlashing;
};

export default useFlashHighlight;
