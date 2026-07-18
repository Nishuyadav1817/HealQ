const ApiError = require('../errors/ApiError');

/**
 * `authorize(...roles)` — role-based access control. Use AFTER `protect`
 * so req.user is already populated.
 *
 * Example: router.post('/queue/call-next', protect, authorize('doctorAssistant'), ...)
 */
const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, 'Not authenticated.'));
  }

  if (!allowedRoles.includes(req.user.role)) {
    return next(new ApiError(403, 'You do not have permission to perform this action.'));
  }

  next();
};

module.exports = authorize;
