const express = require("express");
const router = express.Router({ mergeParams: true });
const paymentController = require("../controllers/payment.controller");
const authenticate = require("../middlewares/auth.middleware");
const { authorizeGroupMember } = require("../middlewares/group.middleware");
const validate = require("../middlewares/validate.middleware");
const { createPaymentSchema } = require("../validators/payment.validation");

router.post(
  "/",
  authenticate,
  authorizeGroupMember,
  validate(createPaymentSchema),
  paymentController.createPayment,
);

router.get("/", authenticate, authorizeGroupMember, paymentController.getPaymentsByGroup);

module.exports = router;
