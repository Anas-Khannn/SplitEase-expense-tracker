const authService = require("../services/auth.service");
const HTTP_STATUSES = require("../constants/http-statuses");
const asyncHandler = require("../middlewares/async-handler.middleware");

const signup = asyncHandler(async (req, res) => {
  const result = await authService.signup(req.body);

  return res.status(HTTP_STATUSES.CREATED).json({
    success: true,
    message: "User registered successfully",
    data: result,
  });
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);

  return res.status(HTTP_STATUSES.OK).json({
    success: true,
    message: "Login successful",
    data: result,
  });
});

const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.user_id);

  return res.status(HTTP_STATUSES.OK).json({
    success: true,
    data: { user },
  });
});

const logout = async (req, res) => {
  return res.status(HTTP_STATUSES.OK).json({
    success: true,
    message: "Logged out successfully",
  });
};

const sendVerificationOtp = asyncHandler(async (req, res) => {
  const data = await authService.sendVerificationOtp(req.body);

  return res.status(HTTP_STATUSES.OK).json({
    success: true,
    message: "Verification code sent",
    data,
  });
});

const verifyEmail = asyncHandler(async (req, res) => {
  const data = await authService.verifyEmail(req.body);

  return res.status(HTTP_STATUSES.OK).json({
    success: true,
    message: "Email verified successfully",
    data,
  });
});

module.exports = {
  signup,
  login,
  getMe,
  logout,
  sendVerificationOtp,
  verifyEmail,
};
