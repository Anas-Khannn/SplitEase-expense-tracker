const summaryService = require("../services/summary.service");
const HTTP_STATUSES = require("../constants/http-statuses");

const getGroupSummary = async (req, res, next) => {
  try {
    const filters = req.validatedQuery || {};
    const summary = await summaryService.getGroupSummary(
      req.params.groupId,
      filters
    );

    return res.status(HTTP_STATUSES.OK).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getGroupSummary };
