const { Op } = require("sequelize");
const {
  Expense,
  ExpenseSplit,
  GroupMember,
  User,
} = require("../database/models");
const { sequelize } = require("../database/models");
const {
  NotFoundError,
  BadRequestError,
} = require("../errors");
const ACTIVITY_TYPES = require("../constants/activity-types");
const { logActivity } = require("./activity.service");

const calculateEqualSplits = (totalAmountCents, participantCount) => {
  const baseShare = Math.floor(totalAmountCents / participantCount);
  const remainder = totalAmountCents - baseShare * participantCount;

  const splits = [];
  for (let i = 0; i < participantCount; i++) {
    const shareCents = i < remainder ? baseShare + 1 : baseShare;
    splits.push(shareCents / 100);
  }

  return splits;
};

const verifyGroupMembers = async (groupId, userIds) => {
  const uniqueUserIds = [...new Set(userIds)];

  const members = await GroupMember.findAll({
    where: {
      group_id: groupId,
      user_id: uniqueUserIds,
    },
  });

  if (members.length !== uniqueUserIds.length) {
    const foundIds = members.map((m) => m.user_id);
    const missing = uniqueUserIds.filter((id) => !foundIds.includes(id));
    throw new BadRequestError(
      `User(s) not found in this group: ${missing.join(", ")}`
    );
  }
};

const validateParticipants = (participantIds) => {
  const unique = [...new Set(participantIds)];
  if (unique.length !== participantIds.length) {
    throw new BadRequestError("Duplicate participant IDs are not allowed");
  }
};

const formatExpenseResponse = (expense) => ({
  expense_id: expense.expense_id,
  group_id: expense.group_id,
  description: expense.description,
  amount: parseFloat(expense.amount).toFixed(2),
  paid_by: expense.paid_by,
  expense_date: expense.expense_date,
  created_at: expense.created_at,
  updated_at: expense.updated_at,
});

const formatSplitResponse = (split) => ({
  expense_split_id: split.expense_split_id,
  user_id: split.user_id,
  share_amount: split.share_amount,
  user: split.user
    ? {
        user_id: split.user.user_id,
        name: split.user.name,
        email: split.user.email,
      }
    : undefined,
});

const createExpense = async (
  groupId,
  { amount, description, paid_by, participant_ids, expense_date },
  actorUserId
) => {
  validateParticipants(participant_ids);

  const payer = await User.findByPk(paid_by);
  if (!payer) {
    throw new NotFoundError("Payer user not found");
  }

  await verifyGroupMembers(groupId, [paid_by, ...participant_ids]);

  const totalAmountCents = Math.round(amount * 100);
  const shares = calculateEqualSplits(totalAmountCents, participant_ids.length);

  const result = await sequelize.transaction(async (t) => {
    const expense = await Expense.create(
      {
        group_id: groupId,
        paid_by,
        description,
        amount,
        expense_date,
      },
      { transaction: t }
    );

    const splitRecords = participant_ids.map((userId, index) => ({
      expense_id: expense.expense_id,
      user_id: userId,
      share_amount: shares[index],
    }));

    await ExpenseSplit.bulkCreate(splitRecords, { transaction: t });

    await logActivity(
      groupId,
      actorUserId,
      ACTIVITY_TYPES.EXPENSE_CREATED,
      `${payer.name} added Rs. ${amount} for ${description}.`,
      t
    );

    const splitsWithUser = await ExpenseSplit.findAll({
      where: { expense_id: expense.expense_id },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["user_id", "name", "email"],
        },
      ],
      transaction: t,
    });

    return {
      ...formatExpenseResponse(expense),
      payer: {
        user_id: payer.user_id,
        name: payer.name,
        email: payer.email,
      },
      splits: splitsWithUser.map(formatSplitResponse),
    };
  });

  return result;
};

const toDateOnly = (date) =>
  date instanceof Date ? date.toISOString().split("T")[0] : date;

const getExpensesByGroup = async (
  groupId,
  { payer_id, start_date, end_date, page = 1, limit = 20 } = {}
) => {
  const where = { group_id: groupId };

  if (payer_id !== undefined && payer_id !== null && payer_id !== "") {
    await verifyGroupMembers(groupId, [payer_id]);
    where.paid_by = payer_id;
  }

  if (start_date || end_date) {
    where.expense_date = {};
    if (start_date) {
      where.expense_date[Op.gte] = toDateOnly(start_date);
    }
    if (end_date) {
      where.expense_date[Op.lte] = toDateOnly(end_date);
    }
  }

  const offset = (page - 1) * limit;

  const { rows: expenses, count } = await Expense.findAndCountAll({
    where,
    include: [
      {
        model: User,
        as: "payer",
        attributes: ["user_id", "name", "email"],
      },
      {
        model: ExpenseSplit,
        as: "splits",
        include: [
          {
            model: User,
            as: "user",
            attributes: ["user_id", "name", "email"],
          },
        ],
      },
    ],
    order: [["created_at", "DESC"]],
    limit,
    offset,
    distinct: true,
  });

  return {
    expenses: expenses.map((expense) => ({
      ...formatExpenseResponse(expense),
      payer: expense.payer
        ? {
            user_id: expense.payer.user_id,
            name: expense.payer.name,
            email: expense.payer.email,
          }
        : undefined,
      splits: expense.splits.map(formatSplitResponse),
    })),
    pagination: {
      page,
      limit,
      total: count,
      total_pages: Math.ceil(count / limit),
    },
  };
};

const getExpenseById = async (groupId, expenseId) => {
  const expense = await Expense.findOne({
    where: { expense_id: expenseId, group_id: groupId },
    include: [
      {
        model: User,
        as: "payer",
        attributes: ["user_id", "name", "email"],
      },
      {
        model: ExpenseSplit,
        as: "splits",
        include: [
          {
            model: User,
            as: "user",
            attributes: ["user_id", "name", "email"],
          },
        ],
      },
    ],
  });

  if (!expense) {
    throw new NotFoundError("Expense not found");
  }

  return {
    ...formatExpenseResponse(expense),
    payer: {
      user_id: expense.payer.user_id,
      name: expense.payer.name,
      email: expense.payer.email,
    },
    splits: expense.splits.map(formatSplitResponse),
  };
};

const updateExpense = async (
  groupId,
  expenseId,
  { amount, description, paid_by, participant_ids, expense_date },
  actorUserId
) => {
  const expense = await Expense.findOne({
    where: { expense_id: expenseId, group_id: groupId },
  });

  if (!expense) {
    throw new NotFoundError("Expense not found");
  }

  const newAmount = amount !== undefined ? amount : expense.amount;
  const newPaidBy = paid_by !== undefined ? paid_by : expense.paid_by;
  const newParticipants =
    participant_ids !== undefined ? participant_ids : null;
  const newDescription =
    description !== undefined ? description : expense.description;
  const newDate =
    expense_date !== undefined ? expense_date : expense.expense_date;

  if (paid_by !== undefined) {
    const payer = await User.findByPk(newPaidBy);
    if (!payer) {
      throw new NotFoundError("Payer user not found");
    }
  }

  let participants = newParticipants;
  if (!participants) {
    const existingSplits = await ExpenseSplit.findAll({
      where: { expense_id: expenseId },
    });
    participants = existingSplits.map((s) => s.user_id);
  }

  if (newParticipants !== undefined) {
    validateParticipants(participants);
  }

  const allUserIds = [newPaidBy, ...participants];
  await verifyGroupMembers(groupId, allUserIds);

  const totalAmountCents = Math.round(newAmount * 100);
  const shares = calculateEqualSplits(totalAmountCents, participants.length);

  const result = await sequelize.transaction(async (t) => {
    await expense.update(
      {
        amount: newAmount,
        description: newDescription,
        paid_by: newPaidBy,
        expense_date: newDate,
      },
      { transaction: t }
    );

    await ExpenseSplit.destroy({
      where: { expense_id: expenseId },
      transaction: t,
    });

    const splitRecords = participants.map((userId, index) => ({
      expense_id: expenseId,
      user_id: userId,
      share_amount: shares[index],
    }));

    await ExpenseSplit.bulkCreate(splitRecords, { transaction: t });

    const updatedExpense = await Expense.findByPk(expenseId, {
      include: [
        {
          model: User,
          as: "payer",
          attributes: ["user_id", "name", "email"],
        },
      ],
      transaction: t,
    });

    const actor = await User.findByPk(actorUserId, { transaction: t });

    await logActivity(
      groupId,
      actorUserId,
      ACTIVITY_TYPES.EXPENSE_UPDATED,
      `${actor.name} updated the ${updatedExpense.description} expense.`,
      t
    );

    const splitsWithUser = await ExpenseSplit.findAll({
      where: { expense_id: expenseId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["user_id", "name", "email"],
        },
      ],
      transaction: t,
    });

    return {
      ...formatExpenseResponse(updatedExpense),
      payer: {
        user_id: updatedExpense.payer.user_id,
        name: updatedExpense.payer.name,
        email: updatedExpense.payer.email,
      },
      splits: splitsWithUser.map(formatSplitResponse),
    };
  });

  return result;
};

const deleteExpense = async (groupId, expenseId, actorUserId) => {
  const expense = await Expense.findOne({
    where: { expense_id: expenseId, group_id: groupId },
  });

  if (!expense) {
    throw new NotFoundError("Expense not found");
  }

  const description = expense.description;

  await sequelize.transaction(async (t) => {
    await expense.destroy({ transaction: t });

    const actor = await User.findByPk(actorUserId, { transaction: t });

    await logActivity(
      groupId,
      actorUserId,
      ACTIVITY_TYPES.EXPENSE_DELETED,
      `${actor.name} deleted the ${description} expense.`,
      t
    );
  });

  return { message: "Expense deleted successfully" };
};

module.exports = {
  createExpense,
  getExpensesByGroup,
  getExpenseById,
  updateExpense,
  deleteExpense,
  calculateEqualSplits,
};
