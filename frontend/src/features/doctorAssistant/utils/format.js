/**
 * Format Utilities for Doctor Assistant
 * Handles time formatting and queue display
 */

/**
 * Format a time slot (e.g., "09:00" becomes "9:00 AM")
 * @param {string} time - Time in HH:MM format
 * @returns {string} - Formatted time with AM/PM
 */
export const formatTimeSlot = (time) => {
  if (!time) return '';

  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${minutes} ${ampm}`;
};

/**
 * Format time difference as "X minutes ago", "X hours ago", etc.
 * @param {Date|string|number} date - The date to format
 * @returns {string} - Relative time string
 */
export const formatWaitingSince = (date) => {
  if (!date) return '';

  const target = new Date(date);
  const now = new Date();
  const diffMs = now - target;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffMs / 86400000);
  return `${diffDays}d ago`;
};

export default {
  formatTimeSlot,
  formatWaitingSince,
};
