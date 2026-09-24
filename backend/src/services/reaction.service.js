const { Expense, ExpenseReaction, GroupMember, User } = require("../database/models");
const { Group } = require("../database/models");
const { NotFoundError, ForbiddenError } = require("../errors");
const { formatReactionResponse } = require("../utils/reaction.utils");
const eventBus = require("../events/event-bus");
const EVENTS = require("../events/events");

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

const addOrUpdateReaction = async (expenseId, userId, reaction) => {
  const expense = await validateExpenseAndMembership(expenseId, userId);

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

  if (expense.paid_by !== userId) {
    const [group, actor] = await Promise.all([
      Group.findByPk(expense.group_id),
      User.findByPk(userId),
    ]);

    eventBus.emit(EVENTS.REACTION_ADDED, {
      targetUserId: expense.paid_by,
      actorUserId: userId,
      groupId: expense.group_id,
      title: `${actor ? actor.name : "Someone"} reacted to your expense`,
      message: `${actor ? actor.name : "Someone"} reacted ${reaction} to ${
        expense.description
      } in ${group ? group.name : "the group"}.`,
      referenceType: "expense",
      referenceId: expenseId,
    });
  }

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
