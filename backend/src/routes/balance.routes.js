const express = require("express");
const router = express.Router({ mergeParams: true });
const balanceController = require("../controllers/balance.controller");
const authenticate = require("../middlewares/auth.middleware");
const { authorizeGroupMember } = require("../middlewares/group.middleware");

router.get("/", authenticate, authorizeGroupMember, balanceController.getGroupBalances);

module.exports = router;
