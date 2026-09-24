/**
 * Small formatting helpers shared by the queue board's cards. Kept
 * defensive — they return null when the source field isn't present on
 * an entry, rather than ever fabricating a placeholder value, so
 * callers can decide whether to render anything at all.
 */

/** `appointment.timeSlot` is `{ start, end }` — same shape Reception's
 * ReceptionAppointmentCard already formats this way. */
export const formatTimeSlot = (slot) => (slot ? `${slot.start}–${slot.end}` : null);

/** `appointment.arrivedAt` is the one arrival timestamp already used
 * elsewhere in the app (see admin's AppointmentDetailModal) — turned
 * into a short "how long have they been waiting" string. */
export const formatWaitingSince = (arrivedAt) => {
  if (!arrivedAt) return null;
  const minutes = Math.max(0, Math.round((Date.now() - new Date(arrivedAt).getTime()) / 60000));
  if (minutes < 1) return 'Just arrived';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return `${hours}h ${rest}m`;
};
