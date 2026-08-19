const balanceService = require("../services/balance.service");
const HTTP_STATUSES = require("../constants/http-statuses");

const getGroupBalances = async (req, res, next) => {
  try {
    const balances = await balanceService.getGroupBalances(
      req.params.groupId
    );

    return res.status(HTTP_STATUSES.OK).json({
      success: true,
      data: { balances },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getGroupBalances };
