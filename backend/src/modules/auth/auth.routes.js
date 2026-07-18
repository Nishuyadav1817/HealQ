const express = require('express');
const router = express.Router();

const authController = require('./auth.controller');
const validate = require('../../middlewares/validate.middleware');
const protect = require('../../middlewares/auth.middleware');
const { authLimiter, forgotPasswordLimiter } = require('../../middlewares/rateLimiter.middleware');
const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require('./auth.validation');

// Public routes
router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post(
  '/forgot-password',
  forgotPasswordLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword
);
router.post(
  '/reset-password/:token',
  validate(resetPasswordSchema),
  authController.resetPassword
);

// Protected routes (require a valid access token)
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.getMe);

module.exports = router;
