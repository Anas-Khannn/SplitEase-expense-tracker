const paymentService = require("../services/payment.service");
const HTTP_STATUSES = require("../constants/http-statuses");
const asyncHandler = require("../middlewares/async-handler.middleware");

const createPayment = asyncHandler(async (req, res) => {
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
});

const getPaymentsByGroup = asyncHandler(async (req, res) => {
  const payments = await paymentService.getPaymentsByGroup(
    req.params.groupId
  );

  return res.status(HTTP_STATUSES.OK).json({
    success: true,
    data: { payments },
  });
});

module.exports = {
  createPayment,
  getPaymentsByGroup,
};
