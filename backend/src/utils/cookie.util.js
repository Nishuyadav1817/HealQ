const config = require('../config/env');

/**
 * Refresh token cookie options:
 * - httpOnly: JavaScript on the frontend can NEVER read this cookie — the
 *   main defense against XSS-based token theft.
 * - secure: only sent over HTTPS in production.
 * - sameSite: 'strict' blocks the cookie from being sent on cross-site
 *   requests — a strong default CSRF defense for the refresh endpoint.
 * - path: scoped to the refresh endpoint only, so the cookie isn't even
 *   transmitted on unrelated API calls.
 */
const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: config.env === 'production',
  sameSite: 'strict',
  path: '/api/v1/auth/refresh-token',
  maxAge: config.jwt.refreshExpiryMs,
};

const clearRefreshTokenCookieOptions = {
  httpOnly: true,
  secure: config.env === 'production',
  sameSite: 'strict',
  path: '/api/v1/auth/refresh-token',
};

module.exports = { refreshTokenCookieOptions, clearRefreshTokenCookieOptions };
