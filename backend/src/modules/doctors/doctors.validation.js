const Joi = require('joi');
const { objectId } = require('../../validators/common.validation');
const { WEEKDAYS } = require('../../constants/enums');

const availabilitySchema = Joi.object({
  day: Joi.string().valid(...WEEKDAYS).required(),
  startTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
  endTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
  slotDurationMinutes: Joi.number().min(5).max(120),
  maxPatients: Joi.number().min(1).max(200),
});

// Creates the doctor's USER (auth) account and Doctor (professional)
// profile in one call — account fields + professional fields together.
const createDoctorSchema = Joi.object({
  // Account/identity fields
  fullName: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().trim().lowercase().email().required(),
  phone: Joi.string().trim().pattern(/^\+?[0-9]{10,15}$/).required(),
  gender: Joi.string().valid('male', 'female', 'other'),
  dateOfBirth: Joi.date().less('now'),

  // Professional/domain fields
  hospital: objectId().required(),
  department: objectId().required(),
  specialization: Joi.string().trim().min(2).max(100).required(),
  qualifications: Joi.array().items(Joi.string().trim()).default([]),
  experienceYears: Joi.number().min(0).max(70).default(0),
  licenseNumber: Joi.string().trim().min(3).max(50).required(),
  consultationFee: Joi.number().min(0).required(),
  availability: Joi.array().items(availabilitySchema).default([]),
});

// Professional fields only. Deliberately excludes `hospital`/`department`
// (use the dedicated assign-hospital / assign-department endpoints, which
// contain cross-collection validation a plain PATCH shouldn't silently
// skip) and excludes account fields like email/phone (those belong to a
// future dedicated user-profile-update endpoint, not the doctor module).
const updateDoctorSchema = Joi.object({
  specialization: Joi.string().trim().min(2).max(100),
  qualifications: Joi.array().items(Joi.string().trim()),
  experienceYears: Joi.number().min(0).max(70),
  licenseNumber: Joi.string().trim().min(3).max(50),
  consultationFee: Joi.number().min(0),
  availability: Joi.array().items(availabilitySchema),
  isAvailableToday: Joi.boolean(),
  isActive: Joi.boolean(),
}).min(1);

const assignHospitalSchema = Joi.object({
  hospital: objectId().required(),
});

const assignDepartmentSchema = Joi.object({
  department: objectId().required(),
});

const markUnavailableSchema = Joi.object({
  date: Joi.date().min('now').required(), // future date or today
  reason: Joi.string().trim().max(200).default('Doctor unavailable'),
});

module.exports = {
  createDoctorSchema,
  updateDoctorSchema,
  assignHospitalSchema,
  assignDepartmentSchema,
  markUnavailableSchema,
};
