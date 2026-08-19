const authService = require("../services/auth.service");
const HTTP_STATUSES = require("../constants/http-statuses");

const signup = async (req, res, next) => {
  try {
    const result = await authService.signup(req.body);

    return res.status(HTTP_STATUSES.CREATED).json({
      success: true,
      message: "User registered successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);

    return res.status(HTTP_STATUSES.OK).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.user_id);

    return res.status(HTTP_STATUSES.OK).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

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
