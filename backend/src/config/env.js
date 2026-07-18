require('dotenv').config();

/**
 * Central config loader. Every other file reads env vars through here —
 * never via process.env directly — so there is exactly one place that
 * knows the shape of our configuration and one place to add validation.
 */

const REQUIRED_IN_PRODUCTION = [
  'MONGO_URI',
  'ACCESS_TOKEN_SECRET',
  'REFRESH_TOKEN_SECRET',
  'CLIENT_URL',
];

if (process.env.NODE_ENV === 'production') {
  const missing = REQUIRED_IN_PRODUCTION.filter((key) => !process.env[key]);
  if (missing.length) {
    // Fail fast on boot rather than limping along with undefined secrets.
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 8989,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/smart-hospital-queue',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  jwt: {
    accessSecret: process.env.ACCESS_TOKEN_SECRET || 'dev_access_secret_change_me',
    accessExpiry: process.env.ACCESS_TOKEN_EXPIRY || '15m',
    refreshSecret: process.env.REFRESH_TOKEN_SECRET || 'dev_refresh_secret_change_me',
    refreshExpiry: process.env.REFRESH_TOKEN_EXPIRY || '7d',
    refreshExpiryMs: 7 * 24 * 60 * 60 * 1000,
  },

  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 12,

  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    fromEmail: process.env.SMTP_FROM_EMAIL || 'no-reply@smarthospital.com',
  },

  security: {
    maxLoginAttempts: Number(process.env.MAX_LOGIN_ATTEMPTS) || 5,
    lockTimeMinutes: Number(process.env.LOCK_TIME_MINUTES) || 15,
    passwordResetExpiryMinutes: Number(process.env.PASSWORD_RESET_EXPIRY_MINUTES) || 10,
  },
};
