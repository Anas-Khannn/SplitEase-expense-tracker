const reactionService = require("../services/reaction.service");
const HTTP_STATUSES = require("../constants/http-statuses");

const addOrUpdateReaction = async (req, res, next) => {
  try {
    const result = await reactionService.addOrUpdateReaction(
      req.params.expenseId,
      req.user.user_id,
      req.body.reaction
    );

    const status = result.created
      ? HTTP_STATUSES.CREATED
      : HTTP_STATUSES.OK;

    return res.status(status).json({
      success: true,
      message: result.created
        ? "Reaction added successfully"
        : "Reaction updated successfully",
      data: { reaction: result.reaction },
    });
  } catch (error) {
    next(error);
  }
};

const getReactionsByExpense = async (req, res, next) => {
  try {
    const reactions = await reactionService.getReactionsByExpense(
      req.params.expenseId,
      req.user.user_id
    );

    return res.status(HTTP_STATUSES.OK).json({
      success: true,
      data: { reactions },
    });
  } catch (error) {
    next(error);
  }
};

const deleteReaction = async (req, res, next) => {
  try {
    const result = await reactionService.deleteReaction(
      req.params.expenseId,
      req.user.user_id
    );

    return res.status(HTTP_STATUSES.OK).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addOrUpdateReaction,
  getReactionsByExpense,
  deleteReaction,
};
