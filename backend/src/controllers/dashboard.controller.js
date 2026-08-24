const dashboardService = require("../services/dashboard.service");
const HTTP_STATUSES = require("../constants/http-statuses");

const getDashboardSummary = async (req, res, next) => {
  try {
    const dashboard = await dashboardService.getUserDashboard(
      req.user.user_id
    );

    return res.status(HTTP_STATUSES.OK).json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardSummary };
