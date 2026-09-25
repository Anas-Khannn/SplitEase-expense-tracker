const userService = require("../services/user.service");
const HTTP_STATUSES = require("../constants/http-statuses");
const asyncHandler = require("../middlewares/async-handler.middleware");

const searchUsers = asyncHandler(async (req, res) => {
  const users = await userService.searchUsers(req.validatedQuery.q, {
    excludeUserId: req.user.user_id,
  });

  return res.status(HTTP_STATUSES.OK).json({
    success: true,
    data: { users },
  });
});

module.exports = {
  searchUsers,
};
