const { fn, col, literal } = require("sequelize");
const { Group, GroupMember, Expense, ExpenseSplit, User } =
  require("../database/models");

const getGroupBalances = async (groupId) => {
  const group = await Group.findByPk(groupId);
  if (!group) {
    const { NotFoundError } = require("../errors");
    throw new NotFoundError("Group not found");
  }

  const members = await GroupMember.findAll({
    where: { group_id: groupId },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["user_id", "name", "email"],
      },
    ],
  });

  const paidResults = await Expense.findAll({
    attributes: [
      "paid_by",
      [fn("SUM", col("amount")), "total_paid"],
    ],
    where: { group_id: groupId },
    group: ["paid_by"],
    raw: true,
  });

  const paidMap = {};
  for (const row of paidResults) {
    paidMap[row.paid_by] = parseFloat(row.total_paid);
  }

  const shareResults = await ExpenseSplit.findAll({
    attributes: [
      "user_id",
      [fn("SUM", col("share_amount")), "total_share"],
    ],
    include: [
      {
        model: Expense,
        as: "expense",
        attributes: [],
        where: { group_id: groupId },
      },
    ],
    group: ["user_id"],
    raw: true,
  });

  const shareMap = {};
  for (const row of shareResults) {
    shareMap[row.user_id] = parseFloat(row.total_share);
  }

  const balances = members.map((member) => {
    const totalPaid = paidMap[member.user.user_id] || 0;
    const totalShare = shareMap[member.user.user_id] || 0;
    const balance = parseFloat((totalPaid - totalShare).toFixed(2));

    let status;
    if (balance > 0) {
      status = "OWED";
    } else if (balance < 0) {
      status = "OWES";
    } else {
      status = "SETTLED";
    }

    return {
      user_id: member.user.user_id,
      name: member.user.name,
      total_paid: parseFloat(totalPaid.toFixed(2)),
      total_share: parseFloat(totalShare.toFixed(2)),
      balance,
      status,
    };
  });

  return balances;
};

module.exports = { getGroupBalances };
