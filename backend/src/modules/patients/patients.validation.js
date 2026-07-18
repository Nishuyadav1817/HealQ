const Joi = require('joi');
const { objectId } = require('../../validators/common.validation');

/**
 * appointmentDate is deliberately validated loosely here (just "is it a
 * real date") — the actual "not in the past" check happens in the service
 * layer by comparing normalized (time-stripped) dates. Doing it there
 * instead of with Joi's `.min('now')` avoids a subtle bug: `.min('now')`
 * compares full timestamps, which would wrongly reject a same-day booking
 * made after midnight on the appointment date itself.
 */
const bookAppointmentSchema = Joi.object({
  hospital: objectId().required(),
  department: objectId().required(),
  doctor: objectId().required(),
  appointmentDate: Joi.date().required(),
  reasonForVisit: Joi.string().trim().max(500).allow('', null),
  symptoms: Joi.array().items(Joi.string().trim().max(100)).default([]),
});

const cancelAppointmentSchema = Joi.object({
  cancellationReason: Joi.string().trim().max(300).allow('', null),
});

module.exports = { bookAppointmentSchema, cancelAppointmentSchema };
