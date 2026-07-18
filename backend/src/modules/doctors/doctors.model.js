const mongoose = require('mongoose');
const { Schema } = mongoose;
const { WEEKDAYS } = require('../../constants/enums');

/**
 * Doctor Schema
 * Professional profile for a user whose role = 'doctor'. Kept SEPARATE from
 * the User collection on purpose:
 *  - User handles authentication identity (email/password/JWT).
 *  - Doctor handles domain/professional data (specialization, fee, schedule).
 * This separation means auth queries (login) never load heavy professional
 * data, and professional data can be queried/indexed independently
 * (e.g. "find all cardiologists" doesn't need to touch password/auth fields).
 */
const doctorSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Doctor must be linked to a user account'],
      unique: true, // one-to-one: each User(role=doctor) has exactly one Doctor profile
    },

    hospital: {
      type: Schema.Types.ObjectId,
      ref: 'Hospital',
      required: [true, 'Doctor must belong to a hospital'],
      index: true,
    },

    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Doctor must belong to a department'],
      index: true,
    },

    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      trim: true,
    },

    qualifications: {
      type: [String], // e.g. ["MBBS", "MD - Cardiology"]
      default: [],
    },

    experienceYears: {
      type: Number,
      min: 0,
      default: 0,
    },

    licenseNumber: {
      type: String,
      required: [true, 'Medical license number is required'],
      unique: true,
      trim: true,
    },

    consultationFee: {
      type: Number,
      required: true,
      min: 0,
    },

    // Weekly recurring availability template used to generate bookable
    // slots. Kept simple/declarative here; slot generation logic (business
    // logic) will live in the service layer, not the schema.
    availability: [
      {
        day: {
          type: String,
          enum: WEEKDAYS,
          required: true,
        },
        startTime: { type: String, required: true }, // "HH:mm"
        endTime: { type: String, required: true },   // "HH:mm"
        slotDurationMinutes: { type: Number, default: 15, min: 5 },
        maxPatients: { type: Number, default: 30, min: 1 },
        _id: false,
      },
    ],

    // Daily operational toggle — lets a doctor/assistant mark the doctor
    // unavailable today (leave, emergency) without touching the weekly
    // availability template.
    isAvailableToday: {
      type: Boolean,
      default: true,
    },

    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    ratingCount: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true, // soft-disable (e.g. doctor left the hospital)
    },
  },
  { timestamps: true }
);

// Most common query: "all active doctors in department X of hospital Y".
doctorSchema.index({ hospital: 1, department: 1, isActive: 1 });

// Powers "search doctors by specialization" (e.g. patient searching "skin").
doctorSchema.index({ specialization: 'text' });

module.exports = mongoose.model('Doctor', doctorSchema);
