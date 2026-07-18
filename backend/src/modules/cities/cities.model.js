const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * City Schema
 * Reference/lookup table. Kept as its own collection (instead of a free-text
 * field on Hospital/User) so that:
 *  - Search/filter by city stays consistent (no "Mumbai" vs "mumbai" vs "Bombay").
 *  - We can attach metadata (state, country) once and reuse everywhere.
 *  - Admin can manage the list of serviceable cities centrally.
 */
const citySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'City name is required'],
      trim: true,
    },

    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },

    country: {
      type: String,
      required: true,
      trim: true,
      default: 'India',
    },

    // Postal codes serviceable in this city — useful for delivery/notification
    // targeting or search-by-pincode features.
    postalCodes: {
      type: [String],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true, // whether the platform currently operates in this city
    },
  },
  { timestamps: true }
);

// A given city name should be unique per state (e.g. two different
// "Springfield"s in two different states are NOT duplicates).
citySchema.index({ name: 1, state: 1 }, { unique: true });

// Text index to power a search-as-you-type "select your city" UI.
citySchema.index({ name: 'text' });

module.exports = mongoose.model('City', citySchema);
