const summaryService = require("../services/summary.service");
const HTTP_STATUSES = require("../constants/http-statuses");
const asyncHandler = require("../middlewares/async-handler.middleware");

const getGroupSummary = asyncHandler(async (req, res) => {
  const filters = req.validatedQuery || {};
  const summary = await summaryService.getGroupSummary(req.params.groupId, filters);

  return res.status(HTTP_STATUSES.OK).json({
    success: true,
    data: summary,
  });
});

module.exports = { getGroupSummary };
