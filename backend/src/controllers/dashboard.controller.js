const dashboardService = require("../services/dashboard.service");
const HTTP_STATUSES = require("../constants/http-statuses");
const asyncHandler = require("../utils/asyncHandler");

const getDashboardSummary = asyncHandler(async (req, res) => {
  const dashboard = await dashboardService.getUserDashboard(
    req.user.user_id
  );

  return res.status(HTTP_STATUSES.OK).json({
    success: true,
    data: dashboard,
  });
});

module.exports = { getDashboardSummary };
