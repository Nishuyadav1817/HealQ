const { normalizeDateOnly } = require('../utils/datetime.util');

/**
 * Single source of truth for room-naming conventions. Every place that
 * needs to join, leave, or emit to a room MUST build the name through
 * these functions — never by hand-writing a template string inline.
 * A single typo'd room name in one file (e.g. `queue_${id}` vs
 * `queue:${id}`) is a classic bug that silently drops events and looks
 * exactly like a "duplicate/missing event" problem from the outside.
 */

/** Each patient's private notification channel. */
const patientRoom = (userId) => `patient:${userId}`;

/** One room per doctor per day — staff clients explicitly subscribe to
 * the specific queue they're viewing, rather than receiving every
 * doctor's updates all the time. */
const queueRoom = (doctorId, date) => {
  const dateKey = normalizeDateOnly(date).toISOString().slice(0, 10);
  return `queue:${doctorId}:${dateKey}`;
};

module.exports = { patientRoom, queueRoom };
