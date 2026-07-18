const mongoose = require('mongoose');
const { Schema } = mongoose;
const { HOSPITAL_TYPE } = require('../../constants/enums');

/**
 * Hospital Schema
 * The tenant/organization root. Departments, Doctors, staff Users (via
 * User.hospital), Appointments and Queues all trace back to a Hospital.
 * Designed so this system can support MULTIPLE hospitals (multi-tenant),
 * not just a single facility.
 */
const hospitalSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Hospital name is required'],
      trim: true,
    },

    // Legal/government registration number — unique per hospital, used for
    // verification and compliance, not for lookups in normal app flow.
    registrationNumber: {
      type: String,
      required: [true, 'Registration number is required'],
      unique: true,
      trim: true,
    },

    type: {
      type: String,
      enum: Object.values(HOSPITAL_TYPE),
      default: HOSPITAL_TYPE.PRIVATE,
    },

    city: {
      type: Schema.Types.ObjectId,
      ref: 'City',
      required: [true, 'City is required'],
      index: true,
    },

    address: {
      line1: { type: String, required: true, trim: true },
      line2: { type: String, trim: true },
      pincode: { type: String, trim: true },
      // GeoJSON point for "hospitals near me" queries via $near / $geoWithin.
      geoLocation: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          default: [0, 0],
        },
      },
    },

    contact: {
      phone: { type: String, required: true, trim: true },
      email: { type: String, trim: true, lowercase: true },
      website: { type: String, trim: true },
    },

    // Staff/patient-facing operating hours (general facility hours — a
    // doctor's own consulting hours live on the Doctor schema).
    operatingHours: {
      openTime: { type: String, default: '09:00' }, // "HH:mm" 24h format
      closeTime: { type: String, default: '21:00' },
    },

    totalBeds: {
      type: Number,
      min: 0,
    },

    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5, // maintained via a post-save hook on a future Review model
    },

    ratingCount: {
      type: Number,
      default: 0,
    },

    logoUrl: {
      type: String,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true, // soft-disable a hospital (e.g. suspended tenant)
    },
  },
  { timestamps: true }
);

// Geospatial index powers "find hospitals near my location".
hospitalSchema.index({ 'address.geoLocation': '2dsphere' });

// Common filter: browse active hospitals within a city.
hospitalSchema.index({ city: 1, isActive: 1 });

// Text index for hospital name search.
hospitalSchema.index({ name: 'text' });

module.exports = mongoose.model('Hospital', hospitalSchema);
