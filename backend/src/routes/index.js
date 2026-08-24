const express = require("express");
const router = express.Router();

const authRoutes = require("./auth.routes");
const groupRoutes = require("./group.routes");
const expenseRoutes = require("./expense.routes");
const balanceRoutes = require("./balance.routes");
const paymentRoutes = require("./payment.routes");
const activityRoutes = require("./activity.routes");
const reactionRoutes = require("./reaction.routes");
const summaryRoutes = require("./summary.routes");
const dashboardRoutes = require("./dashboard.routes");

router.use("/auth", authRoutes);
router.use("/groups", groupRoutes);
router.use("/groups/:groupId/expenses", expenseRoutes);
router.use("/groups/:groupId/balances", balanceRoutes);
router.use("/groups/:groupId/payments", paymentRoutes);
router.use("/groups/:groupId/activity", activityRoutes);
router.use("/groups/:groupId/summary", summaryRoutes);
router.use("/expenses/:expenseId/reactions", reactionRoutes);
router.use("/dashboard", dashboardRoutes);

module.exports = router;
