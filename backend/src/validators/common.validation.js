const Joi = require('joi');

/**
 * Reusable Joi fragment for validating a Mongo ObjectId passed as a string
 * (route params, or an ObjectId reference field in a body). Centralized so
 * every module validates ObjectIds identically instead of re-writing the
 * regex in five places.
 */
const objectId = () =>
  Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .message('must be a valid ID');

/**
 * Reusable Joi fragment for password complexity — same rule everywhere a
 * password is set (self-registration, reset, and admin-set passwords for
 * Receptionist/Doctor Assistant accounts), so the requirement shown in
 * the UI ("At least 8 characters, with an uppercase letter, lowercase
 * letter, number, and symbol.") always matches what the backend enforces.
 */
const passwordComplexity = () =>
  Joi.string()
    .min(8)
    .max(64)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/)
    .required()
    .messages({
      'string.pattern.base':
        'Password must contain an uppercase letter, lowercase letter, number, and symbol.',
    });

module.exports = { objectId, passwordComplexity };
