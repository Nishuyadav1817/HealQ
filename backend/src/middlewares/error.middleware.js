const ApiError = require('../errors/ApiError');
const config = require('../config/env');

/**
 * Single global error handler (registered LAST in app.js). Converts any
 * thrown error — ApiError, raw Mongoose errors, JWT errors, or unexpected
 * bugs — into one consistent JSON shape, and never leaks stack traces or
 * internal details in production.
 */
const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, [], err.stack);
  }

  // Mongoose: invalid ObjectId cast (e.g. malformed :id param)
  if (err.name === 'CastError') {
    error = new ApiError(400, `Invalid value for field: ${err.path}`);
  }

  // Mongoose: duplicate unique key (e.g. email/phone already registered)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    error = new ApiError(409, `${field} is already registered.`);
  }

  // Mongoose: schema validation failure
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    error = new ApiError(400, 'Validation failed', messages);
  }

  const response = {
    success: false,
    message: error.message,
    errors: error.errors && error.errors.length ? error.errors : undefined,
    ...(config.env === 'development' ? { stack: error.stack } : {}),
  };

  res.status(error.statusCode || 500).json(response);
};

module.exports = errorHandler;
