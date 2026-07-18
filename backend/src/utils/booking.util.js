/**
 * Deterministically derives a human-readable booking reference from
 * doctor+date+tokenNumber — since that triple is already guaranteed
 * unique by Appointment's compound unique index, no separate counter
 * collection is needed to keep this collision-free.
 *
 * Format: SHQ-YYYYMMDD-{last5ofDoctorId}-{token padded to 3 digits}
 * e.g.    SHQ-20260710-A3F9C-003
 */
const generateBookingNumber = (doctorId, date, tokenNumber) => {
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const doctorShort = doctorId.toString().slice(-5).toUpperCase();
  const tokenPadded = String(tokenNumber).padStart(3, '0');
  return `SHQ-${dateStr}-${doctorShort}-${tokenPadded}`;
};

module.exports = { generateBookingNumber };
