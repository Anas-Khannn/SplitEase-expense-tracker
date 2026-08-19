const express = require("express");
const router = express.Router();

const authRoutes = require("./auth.routes");
const groupRoutes = require("./group.routes");
const expenseRoutes = require("./expense.routes");

router.use("/auth", authRoutes);
router.use("/groups", groupRoutes);
router.use("/groups/:groupId/expenses", expenseRoutes);

module.exports = router;
