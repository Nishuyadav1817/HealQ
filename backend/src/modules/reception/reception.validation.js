const Joi = require('joi');
const { PAYMENT_METHOD, APPOINTMENT_STATUS } = require('../../constants/enums');

const searchBookingSchema = Joi.object({
  bookingNumber: Joi.string().trim().uppercase().required().messages({
    'any.required': 'bookingNumber query parameter is required.',
  }),
});

/**
 * Powers the Reception dashboard's "Today's Patients" board. `status`
 * narrows to one lifecycle stage (e.g. the "Waiting" tab); `search` is a
 * free-text partial match against bookingNumber, letting reception find
 * a patient fast at a busy counter without needing the exact reference.
 */
const todaysAppointmentsQuerySchema = Joi.object({
  status: Joi.string().valid(...Object.values(APPOINTMENT_STATUS)),
  search: Joi.string().trim().max(50).allow(''),
});

const verifyPatientSchema = Joi.object({
  verificationNotes: Joi.string().trim().max(300).allow('', null),
});

/**
 * `amount` is optional — if omitted, the service defaults it to the
 * doctor's configured consultationFee, which is the common case. It's
 * still accepted explicitly to support discounts/adjustments a
 * receptionist is authorized to apply at the counter.
 */
const collectPaymentSchema = Joi.object({
  method: Joi.string()
    .valid(...Object.values(PAYMENT_METHOD))
    .required(),
  amount: Joi.number().min(0),
});

/**
 * Reception may only move an appointment to these two terminal-ish states
 * directly — 'in-consultation' and 'completed' belong to the Doctor
 * Assistant panel (Panel 2), not Reception.
 */
const updateStatusSchema = Joi.object({
  status: Joi.string().valid('no-show', 'cancelled').required(),
  reason: Joi.string().trim().max(300).allow('', null),
});

module.exports = {
  searchBookingSchema,
  todaysAppointmentsQuerySchema,
  verifyPatientSchema,
  collectPaymentSchema,
  updateStatusSchema,
};
