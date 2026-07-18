const Joi = require('joi');
const { APPOINTMENT_STATUS } = require('../../constants/enums');
const { objectId } = require('../../validators/common.validation');

/**
 * Charts/Analytics tab — how many trailing days of history to aggregate.
 * Capped at 365 for the same reason ApiFeatures caps `limit` at 100: an
 * unbounded range on a date-group aggregation is an easy way for a single
 * request to turn into a full collection scan.
 */
const analyticsQuerySchema = Joi.object({
  days: Joi.number().integer().min(1).max(365).default(30),
});

const patientsQuerySchema = Joi.object({
  search: Joi.string().trim().allow(''),
  isActive: Joi.string().valid('true', 'false'),
  city: objectId(),
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
  sort: Joi.string(),
});

const appointmentsQuerySchema = Joi.object({
  search: Joi.string().trim().allow(''), // matches bookingNumber
  status: Joi.string().valid(...Object.values(APPOINTMENT_STATUS)),
  hospital: objectId(),
  doctor: objectId(),
  department: objectId(),
  from: Joi.date(),
  to: Joi.date(),
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
  sort: Joi.string(),
});

module.exports = { analyticsQuerySchema, patientsQuerySchema, appointmentsQuerySchema };
