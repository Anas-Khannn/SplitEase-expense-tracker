const express = require("express");
const router = express.Router({ mergeParams: true });
const reactionController = require("../controllers/reaction.controller");
const authenticate = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const {
  addReactionSchema,
  expenseIdParamsSchema,
} = require("../validators/reaction.validation");

router.post(
  "/",
  authenticate,
  validate(expenseIdParamsSchema, "params"),
  validate(addReactionSchema),
  reactionController.addOrUpdateReaction
);

router.get(
  "/",
  authenticate,
  validate(expenseIdParamsSchema, "params"),
  reactionController.getReactionsByExpense
);

router.delete(
  "/",
  authenticate,
  validate(expenseIdParamsSchema, "params"),
  reactionController.deleteReaction
);

module.exports = router;
