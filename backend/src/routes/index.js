const express = require("express");
const router = express.Router();

const authRoutes = require("../modules/auth/auth.routes");
const groupRoutes = require("../modules/groups/group.routes");

router.use("/auth", authRoutes);
router.use("/groups", groupRoutes);

module.exports = router;
