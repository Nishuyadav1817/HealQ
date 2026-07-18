const Joi = require('joi');

const createCitySchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  state: Joi.string().trim().min(2).max(100).required(),
  country: Joi.string().trim().min(2).max(100).default('India'),
  postalCodes: Joi.array().items(Joi.string().trim()).default([]),
});

const updateCitySchema = Joi.object({
  name: Joi.string().trim().min(2).max(100),
  state: Joi.string().trim().min(2).max(100),
  country: Joi.string().trim().min(2).max(100),
  postalCodes: Joi.array().items(Joi.string().trim()),
  isActive: Joi.boolean(),
}).min(1);

module.exports = { createCitySchema, updateCitySchema };
