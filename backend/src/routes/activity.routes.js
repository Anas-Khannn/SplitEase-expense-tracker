const express = require("express");
const router = express.Router({ mergeParams: true });
const activityController = require("../controllers/activity.controller");
const authenticate = require("../middlewares/auth.middleware");
const {
  authorizeGroupMember,
} = require("../middlewares/group.middleware");

router.get(
  "/",
  authenticate,
  authorizeGroupMember,
  activityController.getGroupActivities
);

module.exports = router;
