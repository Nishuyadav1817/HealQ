const ApiError = require('../errors/ApiError');

/**
 * Generic Joi-schema validation middleware. Validates req.body, strips
 * unknown fields (defense against mass-assignment of fields like `role`
 * or `isActive` that a client shouldn't be able to set directly), and
 * replaces req.body with the sanitized/coerced value.
 */
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const messages = error.details.map((detail) => detail.message);
    return next(new ApiError(400, 'Validation failed', messages));
  }

  req.body = value;
  next();
};

module.exports = validate;
