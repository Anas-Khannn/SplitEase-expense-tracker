const balanceService = require("../services/balance.service");
const HTTP_STATUSES = require("../constants/http-statuses");
const asyncHandler = require("../middlewares/async-handler.middleware");

const getGroupBalances = asyncHandler(async (req, res) => {
  const balances = await balanceService.getGroupBalances(req.params.groupId);

  return res.status(HTTP_STATUSES.OK).json({
    success: true,
    data: { balances },
  });
});

module.exports = { getGroupBalances };
