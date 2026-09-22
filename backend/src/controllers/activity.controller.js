const activityService = require("../services/activity.service");
const HTTP_STATUSES = require("../constants/http-statuses");
const asyncHandler = require("../middlewares/async-handler.middleware");
const { parsePagination } = require("../utils/pagination.utils");

const getGroupActivities = asyncHandler(async (req, res) => {
  const { page, limit } = parsePagination(req.query);

  const result = await activityService.getGroupActivities(req.params.groupId, { page, limit });

  return res.status(HTTP_STATUSES.OK).json({
    success: true,
    data: result,
  });
});

module.exports = { getGroupActivities };
