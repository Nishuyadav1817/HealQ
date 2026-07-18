const { WEEKDAYS } = require('../constants/enums');

/** Strips the time component, returning a Date at UTC midnight. Lets us
 * compare/store "appointment day" as a simple equality check. */
const normalizeDateOnly = (date) => {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

/** Maps a Date to one of WEEKDAYS ('monday'..'sunday'), matching the
 * lowercase day names used in Doctor.availability. */
const getWeekdayName = (date) => {
  const jsDay = new Date(date).getUTCDay(); // 0=Sunday..6=Saturday
  const mondayFirstIndex = jsDay === 0 ? 6 : jsDay - 1;
  return WEEKDAYS[mondayFirstIndex];
};

const timeToMinutes = (timeStr) => {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

const minutesToTime = (totalMinutes) => {
  const wrapped = ((totalMinutes % 1440) + 1440) % 1440; // wrap safely within a day
  const h = Math.floor(wrapped / 60);
  const m = wrapped % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

const addMinutesToTime = (timeStr, minutesToAdd) =>
  minutesToTime(timeToMinutes(timeStr) + minutesToAdd);

const isTimeAfter = (a, b) => timeToMinutes(a) > timeToMinutes(b);

/** Combines a date-only Date with an "HH:mm" string into one full Date. */
const combineDateAndTime = (date, timeStr) => {
  const d = normalizeDateOnly(date);
  const [h, m] = timeStr.split(':').map(Number);
  d.setUTCHours(h, m, 0, 0);
  return d;
};

/** All hospitals in this system are in India (IST, UTC+5:30 — India
 * does not observe DST, so this is a fixed offset, not a rule-based
 * timezone lookup). Doctor.availability windows ("09:00"–"17:00") are
 * entered by hospital/admin staff meaning LOCAL wall-clock time, so
 * "now" must be computed in that same timezone — not the server's raw
 * UTC clock — or every same-day comparison against them is wrong by
 * ~5.5 hours. (This was exactly the bug: a 1pm IST booking read as
 * 07:30 UTC, which looked like it was BEFORE the clinic's 09:00
 * opening, so the stale token-grid time never got corrected to "now".) */
const IST_OFFSET_MINUTES = 5 * 60 + 30;

/** The current moment, shifted so reading its UTC getters (getUTCHours,
 * getUTCMinutes, and normalizeDateOnly's setUTCHours reset) yields IST
 * wall-clock values instead of true UTC ones. Use this instead of
 * `new Date()` anywhere "now" needs to be compared against a
 * Doctor.availability time string or against an appointment's calendar
 * day. */
const getHospitalNow = () => new Date(Date.now() + IST_OFFSET_MINUTES * 60 * 1000);

/** "HH:mm" for right now (in hospital-local/IST time), rounded UP to
 * the next 5-minute mark so slot times look intentional ("13:10")
 * rather than a random current second ("13:07"). */
const getCurrentTimeString = () => {
  const now = getHospitalNow();
  const rawMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  const roundedMinutes = Math.ceil(rawMinutes / 5) * 5;
  return minutesToTime(roundedMinutes % 1440);
};

/** Whether two dates fall on the same calendar day (UTC, ignoring time). */
const isSameUTCDate = (a, b) => normalizeDateOnly(a).getTime() === normalizeDateOnly(b).getTime();

module.exports = {
  normalizeDateOnly,
  getWeekdayName,
  timeToMinutes,
  minutesToTime,
  addMinutesToTime,
  isTimeAfter,
  combineDateAndTime,
  getCurrentTimeString,
  getHospitalNow,
  isSameUTCDate,
};
