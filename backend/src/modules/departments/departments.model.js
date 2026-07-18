const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Department Schema
 * Represents a medical department within a specific Hospital
 * (e.g. Cardiology, Orthopedics, ENT). Doctors belong to a Department,
 * and Appointments/Queues are frequently filtered/reported by Department.
 */
const departmentSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Department name is required'],
      trim: true,
    },

    hospital: {
      type: Schema.Types.ObjectId,
      ref: 'Hospital',
      required: [true, 'Department must belong to a hospital'],
      index: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    // Optional: a doctor designated as head of department. Referenced (not
    // embedded) since Doctor is its own rich document.
    headDoctor: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
      default: null,
    },

    iconUrl: {
      type: String,
      default: null, // for UI display (e.g. a heart icon for Cardiology)
    },

    // Average consultation duration for this department — used as a
    // fallback when a specific Doctor hasn't set their own slot duration.
    defaultSlotDurationMinutes: {
      type: Number,
      default: 15,
      min: 5,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// A hospital should not have two departments with the identical name.
departmentSchema.index({ hospital: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Department', departmentSchema);
