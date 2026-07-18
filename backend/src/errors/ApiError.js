/**
 * Custom application error. Every intentional error thrown in
 * services/controllers should be an ApiError so the global error handler
 * can format a consistent response instead of leaking raw stack traces or
 * mongoose internals to the client.
 */
class ApiError extends Error {
  constructor(statusCode, message = 'Something went wrong', errors = [], stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors; // array of field-level validation messages, if any
    this.success = false;
    this.data = null;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = ApiError;
