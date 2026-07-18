const { verifyAccessToken } = require('../utils/token.util');
const User = require('../modules/auth/auth.model');

/**
 * Like `protect`, but never rejects the request if a token is missing or
 * invalid — it just leaves req.user undefined and continues. Lets public
 * browse endpoints (e.g. GET /hospitals) behave slightly differently for
 * a logged-in admin (who should see inactive/soft-deleted records too)
 * without forcing authentication on every visitor.
 */
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token =
    authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) return next();

  try {
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id);
    if (user && user.isActive) {
      req.user = user;
    }
  } catch (err) {
    // Invalid/expired token on an optional-auth route — proceed as anonymous
    // rather than throwing, since auth isn't required here.
  }

  next();
};

module.exports = optionalAuth;
