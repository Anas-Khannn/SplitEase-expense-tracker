const activityService = require("../services/activity.service");
const HTTP_STATUSES = require("../constants/http-statuses");
const asyncHandler = require("../middlewares/async-handler.middleware");

const getGroupActivities = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  const result = await activityService.getGroupActivities(req.params.groupId, { page, limit });

  return res.status(HTTP_STATUSES.OK).json({
    success: true,
    data: result,
  });
});

module.exports = { getGroupActivities };
