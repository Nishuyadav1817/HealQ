const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const authService = require('./auth.service');
const {
  refreshTokenCookieOptions,
  clearRefreshTokenCookieOptions,
} = require('../../utils/cookie.util');

const register = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.registerUser(req.body);

  res
    .status(201)
    .cookie('refreshToken', refreshToken, refreshTokenCookieOptions)
    .json(new ApiResponse(201, { user, accessToken }, 'Registered successfully.'));
});

const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.loginUser(req.body);

  res
    .status(200)
    .cookie('refreshToken', refreshToken, refreshTokenCookieOptions)
    .json(new ApiResponse(200, { user, accessToken }, 'Logged in successfully.'));
});

const refreshToken = asyncHandler(async (req, res) => {
  const incoming = req.cookies?.refreshToken;

  const { user, accessToken, refreshToken: newRefreshToken } =
    await authService.refreshAccessToken(incoming);

  res
    .status(200)
    .cookie('refreshToken', newRefreshToken, refreshTokenCookieOptions)
    .json(new ApiResponse(200, { user, accessToken }, 'Token refreshed.'));
});

const logout = asyncHandler(async (req, res) => {
  await authService.logoutUser(req.user._id);

  res
    .status(200)
    .clearCookie('refreshToken', clearRefreshTokenCookieOptions)
    .json(new ApiResponse(200, null, 'Logged out successfully.'));
});

const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body.email);

  // Same generic message whether or not the email existed.
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        null,
        'If an account with that email exists, a password reset link has been sent.'
      )
    );
});

const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.params.token, req.body.password);

  res
    .status(200)
    .json(new ApiResponse(200, null, 'Password reset successfully. Please log in.'));
});

const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, { user: req.user }, 'Current user fetched.'));
});

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
};
