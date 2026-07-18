const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../errors/ApiError');
const { verifyAccessToken } = require('../utils/token.util');
const User = require('../modules/auth/auth.model');

/**
 * `protect` — verifies the JWT access token sent in the Authorization
 * header (Bearer scheme), loads the current user, and attaches it to
 * req.user for downstream handlers. Must run before any `authorize(...)`
 * role check.
 */
const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token =
    authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    throw new ApiError(401, 'Not authenticated. Please log in.');
  }

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Access token expired.');
    }
    throw new ApiError(401, 'Invalid access token.');
  }

  const user = await User.findById(decoded.id);

  if (!user) {
    throw new ApiError(401, 'The user belonging to this token no longer exists.');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'This account has been deactivated.');
  }

  if (user.isPasswordChangedAfter(decoded.iat)) {
    throw new ApiError(401, 'Password was recently changed. Please log in again.');
  }

  req.user = user;
  next();
});

module.exports = protect;
