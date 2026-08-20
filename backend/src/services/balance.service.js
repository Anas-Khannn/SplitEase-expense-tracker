const { fn, col, literal } = require("sequelize");
const { Group, GroupMember, Expense, ExpenseSplit, Payment, User } =
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

  const paymentsMadeResults = await Payment.findAll({
    attributes: [
      "paid_by",
      [fn("SUM", col("amount")), "total_payments_made"],
    ],
    where: { group_id: groupId },
    group: ["paid_by"],
    raw: true,
  });

  const paymentsMadeMap = {};
  for (const row of paymentsMadeResults) {
    paymentsMadeMap[row.paid_by] = parseFloat(row.total_payments_made);
  }

  const paymentsReceivedResults = await Payment.findAll({
    attributes: [
      "paid_to",
      [fn("SUM", col("amount")), "total_payments_received"],
    ],
    where: { group_id: groupId },
    group: ["paid_to"],
    raw: true,
  });

  const paymentsReceivedMap = {};
  for (const row of paymentsReceivedResults) {
    paymentsReceivedMap[row.paid_to] = parseFloat(row.total_payments_received);
  }

  const balances = members.map((member) => {
    const userId = member.user.user_id;
    const totalPaid = paidMap[userId] || 0;
    const totalShare = shareMap[userId] || 0;
    const totalPaymentsMade = paymentsMadeMap[userId] || 0;
    const totalPaymentsReceived = paymentsReceivedMap[userId] || 0;
    const balance = parseFloat(
      (totalPaid - totalShare - totalPaymentsReceived + totalPaymentsMade).toFixed(2)
    );

    let status;
    if (balance > 0) {
      status = "OWED";
    } else if (balance < 0) {
      status = "OWES";
    } else {
      status = "SETTLED";
    }

    return {
      user_id: userId,
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
