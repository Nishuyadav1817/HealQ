const Joi = require('joi');
const { USER_ROLES } = require('../../constants/enums');

/**
 * Roles a person may self-register as through the PUBLIC /register
 * endpoint. Staff accounts (receptionist, doctorAssistant, doctor, admin)
 * are deliberately excluded — those are provisioned by an existing Admin
 * through a separate, protected endpoint (built when we implement the
 * Admin module), never through open self-registration. Even if a client
 * sends role: 'admin' in the body, this schema rejects it.
 */
const PUBLIC_REGISTER_ROLES = [USER_ROLES.PATIENT];

const passwordComplexity = Joi.string()
  .min(8)
  .max(64)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/)
  .required()
  .messages({
    'string.pattern.base':
      'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character.',
    'string.min': 'Password must be at least 8 characters long.',
  });

const registerSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().trim().lowercase().email().required(),
  phone: Joi.string().trim().pattern(/^\+?[0-9]{10,15}$/).required().messages({
    'string.pattern.base': 'Phone number must be 10-15 digits, with an optional leading "+".',
  }),
  password: passwordComplexity,
  gender: Joi.string().valid('male', 'female', 'other'),
  dateOfBirth: Joi.date().less('now'),
  role: Joi.string()
    .valid(...PUBLIC_REGISTER_ROLES)
    .default(USER_ROLES.PATIENT),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().required(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
});

const resetPasswordSchema = Joi.object({
  password: passwordComplexity,
});

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};
