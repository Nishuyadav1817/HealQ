const Appointment = require('../appointments/appointments.model');
const Queue = require('./queue.model');
const ApiError = require('../../errors/ApiError');
const { generateBookingNumber } = require('../../utils/booking.util');
const {
  normalizeDateOnly,
  addMinutesToTime,
  isTimeAfter,
  combineDateAndTime,
  getCurrentTimeString,
  getHospitalNow,
  isSameUTCDate,
} = require('../../utils/datetime.util');
const { APPOINTMENT_STATUS, QUEUE_ENTRY_STATUS, QUEUE_STATUS } = require('../../constants/enums');

/**
 * QueueService — the single owner of all queue DOMAIN logic: token
 * assignment, slot math, booking-number generation, and — the core of
 * this design — recalculating every waiting patient's position, ETA, and
 * wait time whenever the queue's composition changes.
 *
 * CLEAN ARCHITECTURE ROLE: module services (patients, reception,
 * doctorAssistant) are ORCHESTRATORS — they validate their own
 * role-specific concerns (e.g. "does this doctor belong to my hospital?",
 * "has this patient paid?") and then delegate every actual queue-mechanics
 * decision to this class. This means there is exactly ONE place in the
 * codebase that knows how a token number, an ETA, or a queue position is
 * computed — previously this logic was duplicated (and drifting) across
 * three different module services.
 *
 * All methods are static: QueueService is stateless by design — every
 * fact it needs lives in the database, not in an instance — so it never
 * needs to be constructed, and is trivially reusable from any module.
 */
class QueueService {
  // =====================================================================
  // Token & slot assignment — used once, at booking time
  // =====================================================================

  /** Next sequential token for a doctor/date, based on active (non-
   * cancelled) appointments. O(1) — a single indexed count query. */
  static async getNextTokenNumber(doctorId, date) {
    const count = await Appointment.countDocuments({
      doctor: doctorId,
      appointmentDate: date,
      status: { $ne: APPOINTMENT_STATUS.CANCELLED },
    });
    return count + 1;
  }

  /**
   * Pure function, no DB access — derives a scheduled {start, end} time
   * slot from a doctor's day-schedule and a token number. O(1).
   * Throws if the computed slot would run past the doctor's configured
   * end time (a safety net beyond the maxPatients capacity check).
   */
  static computeScheduledSlot(daySchedule, tokenNumber, appointmentDate) {
    const gridStart = addMinutesToTime(
      daySchedule.startTime,
      (tokenNumber - 1) * daySchedule.slotDurationMinutes
    );

    // The grid above assumes every token before this one took EXACTLY
    // one slot's worth of time, starting right at the doctor's opening
    // time — so booking token #4 always landed on the same 09:45 slot
    // whether it was booked at 9am or, as reported, at 1pm. For a
    // same-day booking, if real time has already passed that grid slot
    // (patients running behind, gaps between bookings, etc.), anchor
    // to right now instead — a patient booking at 1pm should see an
    // afternoon slot, not a stale morning one that's already gone by.
    // Future-dated bookings are untouched: the grid is exactly correct
    // for a day that hasn't started yet.
    let start = gridStart;
    if (appointmentDate && isSameUTCDate(appointmentDate, getHospitalNow())) {
      const now = getCurrentTimeString();
      if (isTimeAfter(now, gridStart)) {
        start = now;
      }
    }

    const end = addMinutesToTime(start, daySchedule.slotDurationMinutes);

    if (isTimeAfter(end, daySchedule.endTime)) {
      throw new ApiError(409, 'All slots for this doctor on the selected date are fully booked.');
    }

    return { start, end };
  }

  static generateBookingNumber(doctorId, date, tokenNumber) {
    return generateBookingNumber(doctorId, date, tokenNumber);
  }

  // =====================================================================
  // Queue document + entry creation
  // =====================================================================

  /**
   * Atomically upserts the doctor's Queue document for the date and
   * pushes a new WAITING entry. `averageConsultationMinutes` is only
   * applied via $setOnInsert — i.e. it seeds a BRAND NEW queue's starting
   * assumption, and is never overwritten on an existing queue (which may
   * already have a live, adapted average — see setAverageConsultationMinutes
   * and applyCompletionToAverage below for how it's "configurable").
   */
  static async addEntry(
    { hospitalId, departmentId, doctorId, date, appointmentId, patientId, tokenNumber, averageConsultationMinutes },
    session
  ) {
    return Queue.findOneAndUpdate(
      { doctor: doctorId, date },
      {
        $setOnInsert: {
          hospital: hospitalId,
          department: departmentId,
          doctor: doctorId,
          date,
          averageConsultationMinutes: averageConsultationMinutes || 15,
        },
        $inc: { totalTokensIssued: 1 },
        $push: {
          entries: {
            appointment: appointmentId,
            patient: patientId,
            tokenNumber,
            status: QUEUE_ENTRY_STATUS.WAITING,
          },
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true, session }
    );
  }

  // =====================================================================
  // Configurable average consultation time
  // =====================================================================

  /**
   * Manual override — e.g. an admin/assistant knows this doctor is
   * running a slower/faster clinic today. Immediately triggers a full
   * recalculation since it changes every remaining patient's ETA.
   */
  static async setAverageConsultationMinutes(doctorId, date, minutes) {
    if (!Number.isFinite(minutes) || minutes < 1) {
      throw new ApiError(400, 'averageConsultationMinutes must be a positive number.');
    }
    const queue = await Queue.findOne({ doctor: doctorId, date });
    if (!queue) {
      throw new ApiError(404, 'No queue exists yet for this doctor on this date.');
    }
    queue.averageConsultationMinutes = minutes;
    await queue.save();
    return QueueService.recalculateQueue(doctorId, date);
  }

  /**
   * Automatic adjustment — applies an exponential moving average (recent
   * consultations count for more than older ones) so the estimate adapts
   * across the day. 0.7/0.3 split is a deliberate choice: responsive
   * enough to reflect today's actual pace within 2-3 consultations,
   * stable enough that one unusually long/short visit doesn't whipsaw
   * every other patient's ETA.
   */
  static applyCompletionToAverage(queue, actualMinutes) {
    const clamped = Math.max(actualMinutes, 1);
    queue.averageConsultationMinutes = Math.round(
      queue.averageConsultationMinutes * 0.7 + clamped * 0.3
    );
  }

  // =====================================================================
  // THE recalculation engine
  // =====================================================================

  /**
   * Recomputes queuePosition, estimatedReportingTime, and
   * estimatedWaitingMinutes for every still-WAITING entry in a doctor's
   * queue. Called after any event that changes queue composition — a
   * completion, a skip, or a cancellation — since all three change how
   * many people are ahead of everyone still waiting.
   *
   * Deliberately applies to ALL waiting entries, not just ones Reception
   * has released (isInDoctorQueue) — queue POSITION reflects booking
   * order and is meaningful even to a patient who hasn't arrived yet;
   * "who's callable right now" is a separate, stricter concern (see
   * callNext below).
   *
   * See the complexity analysis in the accompanying documentation for a
   * full breakdown — summary: O(n log n) time, O(1) additional DB round
   * trips (never N+1), where n = patients waiting for this doctor today.
   */
  static async recalculateQueue(doctorId, date, session) {
    const queueQuery = Queue.findOne({ doctor: doctorId, date });
    const queue = session ? await queueQuery.session(session) : await queueQuery;
    if (!queue) return null;

    const waiting = queue.entries
      .filter((e) => e.status === QUEUE_ENTRY_STATUS.WAITING)
      .sort((a, b) => a.tokenNumber - b.tokenNumber);

    if (waiting.length === 0) return queue;

    // Fetch each waiting entry's originally scheduled slot in ONE query
    // (not populate-on-the-queue-then-save, which risks Mongoose
    // re-serializing populated subdocuments incorrectly on save; and not
    // N+1 individual lookups either).
    //
    // MUST use the same session as the caller: bookAppointment calls this
    // mid-transaction, right after creating the Appointment — without
    // `.session(session)` here, this query can't see that just-created,
    // not-yet-committed document, `slots` comes back missing it, and
    // `slotById.get(...)` returns undefined below.
    const appointmentIds = waiting.map((e) => e.appointment);
    const slotsQuery = Appointment.find({ _id: { $in: appointmentIds } }, 'timeSlot');
    const slots = await (session ? slotsQuery.session(session) : slotsQuery).lean();
    const slotById = new Map(slots.map((a) => [a._id.toString(), a.timeSlot]));

    const isToday =
      normalizeDateOnly(date).getTime() === normalizeDateOnly(getHospitalNow()).getTime();
    const now = Date.now();
    const avgMs = queue.averageConsultationMinutes * 60 * 1000;

    waiting.forEach((entry, index) => {
      const position = index + 1; // 1 = next to be called
      const timeSlot = slotById.get(entry.appointment.toString());
      if (!timeSlot) {
        // Should be unreachable now that this query is session-aware, but
        // fail loudly and specifically rather than crashing on `.start`
        // of undefined if some future change reintroduces the gap.
        throw new ApiError(
          500,
          `Queue recalculation couldn't find the scheduled time slot for appointment ${entry.appointment}.`
        );
      }
      const scheduledDateTime = combineDateAndTime(date, timeSlot.start);

      // For a future date, the scheduled slot IS the estimate — "now" is
      // not meaningful days in advance. For today, use whichever is
      // later: the live, position-based estimate, or the original
      // scheduled slot (never promise an earlier time than what was
      // originally booked, even if the doctor is running ahead).
      let eta = scheduledDateTime;
      if (isToday) {
        const liveEstimate = new Date(now + position * avgMs);
        eta = liveEstimate > scheduledDateTime ? liveEstimate : scheduledDateTime;
      }

      entry.queuePosition = position;
      entry.estimatedReportingTime = eta;
      entry.estimatedWaitingMinutes = Math.max(Math.round((eta.getTime() - now) / 60000), 0);
    });

    await queue.save({ session });
    return queue;
  }

  // =====================================================================
  // Per-patient transitions (delegated to by the Doctor Assistant module)
  // =====================================================================

  static findEntry(queue, appointmentId) {
    const entry = queue.entries.find((e) => e.appointment.toString() === appointmentId.toString());
    if (!entry) {
      throw new ApiError(404, 'Queue entry not found for this appointment.');
    }
    return entry;
  }

  /**
   * Selects and calls the next patient. Only appointments Reception has
   * explicitly released (isInDoctorQueue: true) are callable — checked
   * via a single targeted query rather than populating the queue document
   * itself (which this method mutates and the caller then saves).
   */
  static async callNext(queue) {
    if (queue.status !== QUEUE_STATUS.ACTIVE) {
      throw new ApiError(400, `Queue is currently "${queue.status}". Resume it before calling patients.`);
    }

    const waitingEntries = queue.entries
      .filter((e) => e.status === QUEUE_ENTRY_STATUS.WAITING)
      .sort((a, b) => a.tokenNumber - b.tokenNumber);

    if (waitingEntries.length === 0) {
      throw new ApiError(404, 'No patients are currently waiting in the queue.');
    }

    const released = await Appointment.find(
      { _id: { $in: waitingEntries.map((e) => e.appointment) }, isInDoctorQueue: true },
      '_id'
    ).lean();
    const releasedIds = new Set(released.map((a) => a._id.toString()));

    const candidate = waitingEntries.find((e) => releasedIds.has(e.appointment.toString()));
    if (!candidate) {
      throw new ApiError(404, 'No released patients are currently waiting in the queue.');
    }

    candidate.status = QUEUE_ENTRY_STATUS.CALLED;
    candidate.calledAt = new Date();
    queue.currentTokenNumber = candidate.tokenNumber;
    return candidate;
  }

  static startConsultation(entry) {
    if (entry.status !== QUEUE_ENTRY_STATUS.CALLED) {
      throw new ApiError(
        400,
        `Patient must be called before starting consultation (current queue status: "${entry.status}").`
      );
    }
    entry.status = QUEUE_ENTRY_STATUS.IN_CONSULTATION;
    entry.consultationStartedAt = new Date();
    return entry;
  }

  /** Completes the visit and feeds its actual duration into the
   * queue's adaptive average (see applyCompletionToAverage). */
  static completeConsultation(queue, entry) {
    if (entry.status !== QUEUE_ENTRY_STATUS.IN_CONSULTATION) {
      throw new ApiError(
        400,
        `Cannot complete — consultation has not been started (current queue status: "${entry.status}").`
      );
    }
    entry.status = QUEUE_ENTRY_STATUS.COMPLETED;
    entry.completedAt = new Date();

    const actualMinutes = Math.max((entry.completedAt - entry.consultationStartedAt) / 60000, 1);
    QueueService.applyCompletionToAverage(queue, actualMinutes);

    return { entry, actualMinutes };
  }

  /** Reversible — does not touch the linked Appointment's status, so
   * Reception/Admin can still decide how to handle the patient afterward. */
  static skipPatient(entry) {
    if (![QUEUE_ENTRY_STATUS.WAITING, QUEUE_ENTRY_STATUS.CALLED].includes(entry.status)) {
      throw new ApiError(400, `Cannot skip a patient with queue status "${entry.status}".`);
    }
    entry.status = QUEUE_ENTRY_STATUS.SKIPPED;
    return entry;
  }

  static pause(queue) {
    if (queue.status === QUEUE_STATUS.PAUSED) {
      throw new ApiError(400, 'Queue is already paused.');
    }
    if (queue.status === QUEUE_STATUS.CLOSED) {
      throw new ApiError(400, 'Cannot pause a closed queue.');
    }
    queue.status = QUEUE_STATUS.PAUSED;
    return queue;
  }

  static resume(queue) {
    if (queue.status === QUEUE_STATUS.ACTIVE) {
      throw new ApiError(400, 'Queue is already active.');
    }
    if (queue.status === QUEUE_STATUS.CLOSED) {
      throw new ApiError(400, 'Cannot resume a closed queue.');
    }
    queue.status = QUEUE_STATUS.ACTIVE;
    return queue;
  }
}

module.exports = QueueService;
