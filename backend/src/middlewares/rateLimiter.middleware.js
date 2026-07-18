const rateLimit = require('express-rate-limit');

/**
 * Applied to /register and /login. Throttles brute-force credential
 * guessing and registration spam per IP. Combined with the account-level
 * lockout in the User model, this gives two independent layers of
 * brute-force defense (per-IP AND per-account).
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Please try again later.' },
});

/**
 * Stricter, separate limiter for forgot-password — prevents an attacker
 * from using the endpoint to spam/email-bomb an arbitrary inbox.
 */
const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many password reset requests. Please try again in an hour.',
  },
});

module.exports = { authLimiter, forgotPasswordLimiter };
