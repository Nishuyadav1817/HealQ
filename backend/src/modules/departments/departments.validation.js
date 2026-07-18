const Joi = require('joi');
const { objectId } = require('../../validators/common.validation');

const createDepartmentSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  hospital: objectId().required(),
  description: Joi.string().trim().max(500).allow('', null),
  defaultSlotDurationMinutes: Joi.number().integer().min(5).default(15),
});

const updateDepartmentSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100),
  description: Joi.string().trim().max(500).allow('', null),
  defaultSlotDurationMinutes: Joi.number().integer().min(5),
  headDoctor: objectId().allow(null),
  isActive: Joi.boolean(),
  // Deliberately no `hospital` here — moving a department to a different
  // hospital is a structural change with cascading implications on its
  // doctors' appointments/queues; not exposed as a simple field edit.
}).min(1);

module.exports = { createDepartmentSchema, updateDepartmentSchema };
