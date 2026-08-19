const express = require("express");
const router = express.Router();

const authRoutes = require("./auth.routes");
const groupRoutes = require("./group.routes");

router.use("/auth", authRoutes);
router.use("/groups", groupRoutes);

module.exports = router;
