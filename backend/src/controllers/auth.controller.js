const authService = require("../services/auth.service");
const HTTP_STATUSES = require("../constants/http-statuses");
const asyncHandler = require("../utils/asyncHandler");

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

module.exports = {
  signup,
  login,
  getMe,
  logout,
};
