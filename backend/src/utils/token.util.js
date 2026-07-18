const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config/env');

/**
 * Access token: short-lived (default 15m), sent in the Authorization
 * header on every request, holds {id, role} so RBAC middleware can check
 * permissions WITHOUT hitting the database on every single request.
 */
const generateAccessToken = (user) =>
  jwt.sign({ id: user._id.toString(), role: user.role }, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiry,
  });

/**
 * Refresh token: long-lived (default 7d), sent ONLY as an httpOnly cookie
 * (never accessible to JS / never stored in localStorage — that's what
 * protects it from XSS token theft). Holds only {id}; role is re-derived
 * from the DB on refresh so a role change takes effect without waiting for
 * the old access token to expire.
 */
const generateRefreshToken = (user) =>
  jwt.sign({ id: user._id.toString() }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiry,
  });

const verifyAccessToken = (token) => jwt.verify(token, config.jwt.accessSecret);
const verifyRefreshToken = (token) => jwt.verify(token, config.jwt.refreshSecret);

/**
 * We NEVER store a raw refresh token in the database. Only its SHA-256
 * hash is stored (on User.refreshToken). If the database were ever leaked,
 * the attacker would get hashes, not usable tokens — same principle as
 * password hashing, applied to refresh tokens.
 */
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
};
