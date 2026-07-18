const mongoose = require('mongoose');
const { Schema } = mongoose;
const { APPOINTMENT_STATUS, CONSULTATION_TYPE } = require('../../constants/enums');

/**
 * Appointment Schema
 * The BOOKING RECORD — represents a patient's reserved slot with a doctor
 * on a specific date. This is distinct from Queue (which tracks the live,
 * real-time position of patients on the day of the visit). Appointment is
 * the source of truth for "what was booked"; Queue is the source of truth
 * for "what's happening right now in the waiting room".
 */
const appointmentSchema = new Schema(
  {
    patient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient is required'],
      index: true,
    },

    doctor: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Doctor is required'],
      index: true,
    },

    // Denormalized alongside doctor/department for fast filtering/reporting
    // without populate() — a very common production trade-off (a bit of
    // redundancy for read performance) since hospital/department rarely
    // change for a given doctor.
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

    // Normalized to midnight (date only, no time) so date-range queries
    // ("today's appointments") are simple equality/range checks.
    appointmentDate: {
      type: Date,
      required: [true, 'Appointment date is required'],
      index: true,
    },

    timeSlot: {
      start: { type: String, required: true }, // "HH:mm"
      end: { type: String, required: true },   // "HH:mm"
    },

    // Sequential number for this doctor on this date — what the patient
    // sees as "Token #14". Assigned by the service layer, not auto-generated
    // here, since it depends on how many tokens already exist for that
    // doctor/date combination.
    tokenNumber: {
      type: Number,
      required: true,
    },

    // Human-readable booking reference shown to the patient (e.g.
    // "SHQ-20260710-A3F9C-003"), deterministically derived from
    // doctor+date+tokenNumber so it's guaranteed unique without a separate
    // counter collection.
    bookingNumber: {
      type: String,
      required: true,
      unique: true,
    },

    status: {
      type: String,
      enum: Object.values(APPOINTMENT_STATUS),
      default: APPOINTMENT_STATUS.PENDING,
      index: true,
    },

    consultationType: {
      type: String,
      enum: Object.values(CONSULTATION_TYPE),
      default: CONSULTATION_TYPE.ONLINE_BOOKING,
    },

    reasonForVisit: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    symptoms: {
      type: [String],
      default: [],
    },

    // Who created this appointment — a patient booking for themselves, or a
    // receptionist booking on a patient's behalf (walk-in). Useful for
    // audit trails and analytics ("% of bookings via reception vs self-serve").
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    payment: {
      type: Schema.Types.ObjectId,
      ref: 'Payment',
      default: null, // set once payment is initiated/completed
    },

    cancelledBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    cancellationReason: {
      type: String,
      trim: true,
      default: null,
    },

    // --- Reception (Panel 1) workflow tracking ---
    // Recorded when a receptionist confirms the patient's identity against
    // the booking — a distinct, auditable step from simply looking the
    // booking up.
    verifiedAt: {
      type: Date,
      default: null,
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    verificationNotes: {
      type: String,
      trim: true,
      maxlength: 300,
      default: null,
    },

    // When reception marks the patient as physically present at the
    // hospital (sets status -> 'checked-in').
    arrivedAt: {
      type: Date,
      default: null,
    },

    // A patient can be checked-in at reception WITHOUT yet being callable
    // by the doctor — e.g. payment is still being processed at the
    // counter. Only set true by the explicit "move to doctor queue"
    // reception action, so the Doctor Assistant panel's callable list is
    // never contaminated by patients reception hasn't finished processing.
    isInDoctorQueue: {
      type: Boolean,
      default: false,
    },

    // Free-text notes added by doctor/assistant after consultation
    // (kept minimal here; a full EHR/prescription model is a future module).
    consultationNotes: {
      type: String,
      trim: true,
      default: null,
    },
  },
  { timestamps: true }
);

// Prevents double-booking the same token for the same doctor on the same day.
appointmentSchema.index(
  { doctor: 1, appointmentDate: 1, tokenNumber: 1 },
  { unique: true }
);

// "My appointments" screen for a patient, most recent first.
appointmentSchema.index({ patient: 1, appointmentDate: -1 });

// Reception/doctor dashboards: "today's appointments for this hospital by status".
appointmentSchema.index({ hospital: 1, appointmentDate: 1, status: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
