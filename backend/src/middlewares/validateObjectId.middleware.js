const mongoose = require('mongoose');
const ApiError = require('../errors/ApiError');

/**
 * Rejects a request early (400) if a route param isn't a well-formed
 * MongoDB ObjectId, instead of letting it fall through to a Mongoose
 * CastError deep in the service layer. Cheap check, saves a DB round trip.
 *
 * Usage: router.get('/:id', validateObjectId('id'), controller.getById)
 */
const validateObjectId = (paramName = 'id') => (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params[paramName])) {
    return next(new ApiError(400, `Invalid ${paramName}.`));
  }
  next();
};

module.exports = validateObjectId;
