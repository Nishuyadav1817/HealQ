const ApiError = require('../errors/ApiError');

/**
 * Same idea as validate.middleware.js but validates req.query instead of
 * req.body — needed for GET endpoints like "search by booking number"
 * where the input arrives as a query string, not a JSON body.
 */
const validateQuery = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.query, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const messages = error.details.map((detail) => detail.message);
    return next(new ApiError(400, 'Validation failed', messages));
  }

  // Express 5 makes req.query a read-only getter, so `req.query = value`
  // throws "Cannot set property query of #<IncomingMessage> which has
  // only a getter". Mutate the existing object in place instead.
  Object.keys(req.query).forEach((key) => delete req.query[key]);
  Object.assign(req.query, value);
  next();
};

module.exports = validateQuery;
