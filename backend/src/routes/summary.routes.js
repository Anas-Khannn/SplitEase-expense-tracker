const express = require("express");
const router = express.Router({ mergeParams: true });
const summaryController = require("../controllers/summary.controller");
const authenticate = require("../middlewares/auth.middleware");
const {
  authorizeGroupMember,
} = require("../middlewares/group.middleware");
const validate = require("../middlewares/validate.middleware");
const {
  getSummaryQuerySchema,
} = require("../validators/summary.validation");

router.get(
  "/",
  authenticate,
  authorizeGroupMember,
  validate(getSummaryQuerySchema, "query"),
  summaryController.getGroupSummary
);

module.exports = router;
