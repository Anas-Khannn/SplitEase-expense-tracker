const express = require("express");
const router = express.Router({ mergeParams: true });
const reactionController = require("../controllers/reaction.controller");
const authenticate = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const { addReactionSchema } = require("../validators/reaction.validation");

router.post(
  "/",
  authenticate,
  validate(addReactionSchema),
  reactionController.addOrUpdateReaction
);

router.get(
  "/",
  authenticate,
  reactionController.getReactionsByExpense
);

router.delete(
  "/",
  authenticate,
  reactionController.deleteReaction
);

module.exports = router;
