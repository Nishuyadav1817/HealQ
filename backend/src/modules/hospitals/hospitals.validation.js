const Joi = require('joi');
const { HOSPITAL_TYPE } = require('../../constants/enums');
const { objectId } = require('../../validators/common.validation');

const addressSchema = Joi.object({
  line1: Joi.string().trim().required(),
  line2: Joi.string().trim().allow('', null),
  pincode: Joi.string().trim().allow('', null),
  geoLocation: Joi.object({
    coordinates: Joi.array().items(Joi.number()).length(2), // [longitude, latitude]
  }),
});

const contactSchema = Joi.object({
  phone: Joi.string().trim().required(),
  email: Joi.string().trim().lowercase().email().allow('', null),
  website: Joi.string().trim().uri().allow('', null),
});

const createHospitalSchema = Joi.object({
  name: Joi.string().trim().min(2).max(150).required(),
  registrationNumber: Joi.string().trim().required(),
  type: Joi.string().valid(...Object.values(HOSPITAL_TYPE)),
  city: objectId().required(),
  address: addressSchema.required(),
  contact: contactSchema.required(),
  operatingHours: Joi.object({
    openTime: Joi.string(),
    closeTime: Joi.string(),
  }),
  totalBeds: Joi.number().integer().min(0),
});

const updateHospitalSchema = Joi.object({
  name: Joi.string().trim().min(2).max(150),
  registrationNumber: Joi.string().trim(),
  type: Joi.string().valid(...Object.values(HOSPITAL_TYPE)),
  city: objectId(),
  address: addressSchema,
  contact: contactSchema,
  operatingHours: Joi.object({
    openTime: Joi.string(),
    closeTime: Joi.string(),
  }),
  totalBeds: Joi.number().integer().min(0),
  isActive: Joi.boolean(),
}).min(1);

module.exports = { createHospitalSchema, updateHospitalSchema };
