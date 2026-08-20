const express = require("express");
const router = express.Router();

const authRoutes = require("./auth.routes");
const groupRoutes = require("./group.routes");
const expenseRoutes = require("./expense.routes");
const balanceRoutes = require("./balance.routes");
const paymentRoutes = require("./payment.routes");

router.use("/auth", authRoutes);
router.use("/groups", groupRoutes);
router.use("/groups/:groupId/expenses", expenseRoutes);
router.use("/groups/:groupId/balances", balanceRoutes);
router.use("/groups/:groupId/payments", paymentRoutes);

module.exports = router;
