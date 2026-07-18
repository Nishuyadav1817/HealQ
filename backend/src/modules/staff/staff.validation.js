const Joi = require('joi');
const { objectId, passwordComplexity } = require('../../validators/common.validation');

const phone = Joi.string()
  .trim()
  .pattern(/^\+?[0-9]{10,15}$/)
  .required()
  .messages({
    'string.pattern.base': 'Phone number must be 10-15 digits, with an optional leading "+".',
  });

// Receptionist is scoped to a single hospital — they check patients in,
// collect payment, and manage the front desk for that hospital only.
const createReceptionistSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().trim().lowercase().email().required(),
  phone,
  password: passwordComplexity(),
  gender: Joi.string().valid('male', 'female', 'other'),
  hospital: objectId().required(),
});

// Doctor Assistant is scoped to BOTH a hospital AND one specific doctor —
// they manage that one doctor's queue only (see doctorAssistant.service.js,
// which enforces this on every queue action, not just at creation time).
const createDoctorAssistantSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().trim().lowercase().email().required(),
  phone,
  password: passwordComplexity(),
  gender: Joi.string().valid('male', 'female', 'other'),
  hospital: objectId().required(),
  assignedDoctor: objectId().required(),
});

const staffQuerySchema = Joi.object({
  role: Joi.string().valid('receptionist', 'doctorAssistant'),
  hospital: objectId(),
  isActive: Joi.string().valid('true', 'false'),
  search: Joi.string().trim().max(100),
  sort: Joi.string(),
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
});

// Deliberately narrow: isActive (deactivate/reactivate) plus
// assignedDoctor (re-point a Doctor Assistant to a different doctor).
// Everything else about a staff account (name/email/phone/hospital) isn't
// exposed as a plain field edit here, same reasoning as updateDoctorSchema.
const updateStaffSchema = Joi.object({
  isActive: Joi.boolean(),
  assignedDoctor: objectId().allow(null),
}).min(1);

module.exports = {
  createReceptionistSchema,
  createDoctorAssistantSchema,
  staffQuerySchema,
  updateStaffSchema,
};
