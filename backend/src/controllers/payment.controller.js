const paymentService = require("../services/payment.service");
const HTTP_STATUSES = require("../constants/http-statuses");

const createPayment = async (req, res, next) => {
  try {
    const result = await paymentService.createPayment(
      req.params.groupId,
      req.user.user_id,
      req.body
    );

    return res.status(HTTP_STATUSES.CREATED).json({
      success: true,
      message: "Payment created successfully",
      data: { payment: result },
    });
  } catch (error) {
    next(error);
  }
};

const getPaymentsByGroup = async (req, res, next) => {
  try {
    const payments = await paymentService.getPaymentsByGroup(
      req.params.groupId
    );

    return res.status(HTTP_STATUSES.OK).json({
      success: true,
      data: { payments },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPayment,
  getPaymentsByGroup,
};
