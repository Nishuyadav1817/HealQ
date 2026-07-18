const Joi = require('joi');
const { objectId } = require('../../validators/common.validation');

const queueQuerySchema = Joi.object({
  doctor: objectId().required(),
  date: Joi.date(), // optional — defaults to today in the service layer
});

const doctorDateSchema = Joi.object({
  doctor: objectId().required(),
  date: Joi.date(),
});

const setAverageConsultationTimeSchema = Joi.object({
  doctor: objectId().required(),
  date: Joi.date(),
  averageConsultationMinutes: Joi.number().min(1).max(180).required(),
});

module.exports = { queueQuerySchema, doctorDateSchema, setAverageConsultationTimeSchema };
