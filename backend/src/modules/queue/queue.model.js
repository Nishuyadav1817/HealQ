const mongoose = require('mongoose');
const { Schema } = mongoose;
const { QUEUE_ENTRY_STATUS, QUEUE_STATUS } = require('../../constants/enums');

/**
 * Queue Schema
 * ONE document per (doctor, date) — represents the LIVE, real-time waiting
 * room state for that doctor on that day. This is what Socket.IO broadcasts
 * update as patients check in, get called, and finish consultation.
 *
 * Design choice — embedding `entries` as a sub-array instead of a separate
 * collection: queue entries for a single doctor/day are naturally bounded
 * (a doctor sees maybe 20-100 patients/day), always read/written together
 * ("give me the whole queue board"), and need to be updated atomically and
 * broadcast as one unit over sockets. Embedding avoids N+1 queries when
 * rendering the live queue board and keeps Socket.IO payloads simple
 * (emit the whole updated document). If a hospital ever needed unbounded
 * history per entry (e.g. detailed audit log), that would move to its own
 * collection — but for operational queue state, embedding is the right call.
 */
const queueEntrySchema = new Schema(
  {
    appointment: {
      type: Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
    },

    patient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    tokenNumber: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: Object.values(QUEUE_ENTRY_STATUS),
      default: QUEUE_ENTRY_STATUS.WAITING,
    },

    // --- Recomputed by QueueService.recalculateQueue() every time the
    // queue composition changes (a completion, skip, or cancellation).
    // Persisted (not computed on-the-fly on every read) so a Socket.IO
    // broadcast can push each patient their freshly updated numbers the
    // moment they change, rather than waiting for the client to re-poll.
    queuePosition: {
      type: Number,
      default: null, // 1 = next to be called; null once no longer waiting
    },
    estimatedReportingTime: {
      type: Date,
      default: null,
    },
    estimatedWaitingMinutes: {
      type: Number,
      default: null,
    },

    // Lifecycle timestamps for this specific patient's journey through the
    // queue — used for analytics like "average wait time".
    checkedInAt: { type: Date, default: null },
    calledAt: { type: Date, default: null },
    consultationStartedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
  },
  { _id: true, timestamps: false }
  // _id: true so the frontend/socket layer can target a single entry
  // for updates (e.g. "mark THIS entry as completed") via entries.$.
);

const queueSchema = new Schema(
  {
    hospital: {
      type: Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
      index: true,
    },

    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
      index: true,
    },

    doctor: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
      index: true,
    },

    // Date-only (midnight normalized) — one Queue document exists per
    // doctor per calendar day.
    date: {
      type: Date,
      required: true,
    },

    // The token currently being served — drives the "Now Serving: #12"
    // display that patients watch in real time.
    currentTokenNumber: {
      type: Number,
      default: 0,
    },

    totalTokensIssued: {
      type: Number,
      default: 0,
    },

    entries: {
      type: [queueEntrySchema],
      default: [],
    },

    status: {
      type: String,
      enum: Object.values(QUEUE_STATUS),
      default: QUEUE_STATUS.ACTIVE,
    },

    // Running average, recalculated as patients complete consultation —
    // powers "estimated wait time" shown to patients still waiting.
    averageConsultationMinutes: {
      type: Number,
      default: 15,
    },
  },
  { timestamps: true }
);

// One live queue per doctor per day — prevents duplicate queue documents.
queueSchema.index({ doctor: 1, date: 1 }, { unique: true });

// Reception/admin dashboard: "all active queues in this hospital today".
queueSchema.index({ hospital: 1, date: 1, status: 1 });

module.exports = mongoose.model('Queue', queueSchema);
