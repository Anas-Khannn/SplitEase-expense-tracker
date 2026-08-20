const {
  Expense,
  ExpenseReaction,
  GroupMember,
  User,
} = require("../database/models");
const {
  NotFoundError,
  ForbiddenError,
} = require("../errors");

const validateExpenseAndMembership = async (expenseId, userId) => {
  const expense = await Expense.findByPk(expenseId);
  if (!expense) {
    throw new NotFoundError("Expense not found");
  }

  const membership = await GroupMember.findOne({
    where: { group_id: expense.group_id, user_id: userId },
  });

  if (!membership) {
    throw new ForbiddenError("You are not a member of this group");
  }

  return expense;
};

const formatReactionResponse = (reaction) => ({
  reaction_id: reaction.reaction_id,
  expense_id: reaction.expense_id,
  user_id: reaction.user_id,
  reaction: reaction.reaction,
  created_at: reaction.created_at,
  user: reaction.user
    ? {
        user_id: reaction.user.user_id,
        name: reaction.user.name,
        email: reaction.user.email,
      }
    : undefined,
});

const addOrUpdateReaction = async (expenseId, userId, reaction) => {
  await validateExpenseAndMembership(expenseId, userId);

  const existingReaction = await ExpenseReaction.findOne({
    where: { expense_id: expenseId, user_id: userId },
  });

  if (existingReaction) {
    await existingReaction.update({ reaction });
    return { reaction: formatReactionResponse(existingReaction), created: false };
  }

  const newReaction = await ExpenseReaction.create({
    expense_id: expenseId,
    user_id: userId,
    reaction,
  });

  const full = await ExpenseReaction.findByPk(newReaction.reaction_id, {
    include: [
      {
        model: User,
        as: "user",
        attributes: ["user_id", "name", "email"],
      },
    ],
  });

  return { reaction: formatReactionResponse(full), created: true };
};

const getReactionsByExpense = async (expenseId, userId) => {
  await validateExpenseAndMembership(expenseId, userId);

  const reactions = await ExpenseReaction.findAll({
    where: { expense_id: expenseId },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["user_id", "name", "email"],
      },
    ],
  });

  return reactions.map(formatReactionResponse);
};

const deleteReaction = async (expenseId, userId) => {
  await validateExpenseAndMembership(expenseId, userId);

  const reaction = await ExpenseReaction.findOne({
    where: { expense_id: expenseId, user_id: userId },
  });

  if (!reaction) {
    throw new NotFoundError("Reaction not found");
  }

  await reaction.destroy();
  return { message: "Reaction deleted successfully" };
};

module.exports = {
  addOrUpdateReaction,
  getReactionsByExpense,
  deleteReaction,
};
