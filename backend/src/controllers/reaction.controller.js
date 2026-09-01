const reactionService = require("../services/reaction.service");
const HTTP_STATUSES = require("../constants/http-statuses");
const asyncHandler = require("../middlewares/async-handler.middleware");

const addOrUpdateReaction = asyncHandler(async (req, res) => {
  const result = await reactionService.addOrUpdateReaction(
    req.params.expenseId,
    req.user.user_id,
    req.body.reaction,
  );

  const status = result.created ? HTTP_STATUSES.CREATED : HTTP_STATUSES.OK;

  return res.status(status).json({
    success: true,
    message: result.created ? "Reaction added successfully" : "Reaction updated successfully",
    data: { reaction: result.reaction },
  });
});

const getReactionsByExpense = asyncHandler(async (req, res) => {
  const reactions = await reactionService.getReactionsByExpense(
    req.params.expenseId,
    req.user.user_id,
  );

  return res.status(HTTP_STATUSES.OK).json({
    success: true,
    data: { reactions },
  });
});

const deleteReaction = asyncHandler(async (req, res) => {
  const result = await reactionService.deleteReaction(req.params.expenseId, req.user.user_id);

  return res.status(HTTP_STATUSES.OK).json({
    success: true,
    message: result.message,
  });
});

module.exports = {
  addOrUpdateReaction,
  getReactionsByExpense,
  deleteReaction,
};
