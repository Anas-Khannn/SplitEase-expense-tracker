const { fn, col } = require("sequelize");
const { Group, GroupMember, Expense, ExpenseSplit, Payment, User } = require("../database/models");

const buildFinancialMaps = async (groupId) => {
  const paidResults = await Expense.findAll({
    attributes: ["paid_by", [fn("SUM", col("amount")), "total_paid"]],
    where: { group_id: groupId },
    group: ["paid_by"],
    raw: true,
  });

  const shareResults = await ExpenseSplit.findAll({
    attributes: ["user_id", [fn("SUM", col("share_amount")), "total_share"]],
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

  const paymentsMadeResults = await Payment.findAll({
    attributes: ["paid_by", [fn("SUM", col("amount")), "total_payments_made"]],
    where: { group_id: groupId },
    group: ["paid_by"],
    raw: true,
  });

  const paymentsReceivedResults = await Payment.findAll({
    attributes: ["paid_to", [fn("SUM", col("amount")), "total_payments_received"]],
    where: { group_id: groupId },
    group: ["paid_to"],
    raw: true,
  });

  const toMap = (rows, key, valueKey) => {
    const map = {};
    for (const row of rows) {
      map[row[key]] = parseFloat(row[valueKey]);
    }
    return map;
  };

  return {
    paidMap: toMap(paidResults, "paid_by", "total_paid"),
    shareMap: toMap(shareResults, "user_id", "total_share"),
    paymentsMadeMap: toMap(paymentsMadeResults, "paid_by", "total_payments_made"),
    paymentsReceivedMap: toMap(paymentsReceivedResults, "paid_to", "total_payments_received"),
  };
};

const computeBalance = ({ totalPaid, totalShare, totalPaymentsMade, totalPaymentsReceived }) =>
  parseFloat((totalPaid - totalShare - totalPaymentsReceived + totalPaymentsMade).toFixed(2));

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

  const { paidMap, shareMap, paymentsMadeMap, paymentsReceivedMap } =
    await buildFinancialMaps(groupId);

  const balances = members.map((member) => {
    const userId = member.user.user_id;
    const totalPaid = paidMap[userId] || 0;
    const totalShare = shareMap[userId] || 0;
    const totalPaymentsMade = paymentsMadeMap[userId] || 0;
    const totalPaymentsReceived = paymentsReceivedMap[userId] || 0;
    const balance = computeBalance({
      totalPaid,
      totalShare,
      totalPaymentsMade,
      totalPaymentsReceived,
    });

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

const calculateUserGroupBalance = async (userId, groupId) => {
  const { paidMap, shareMap, paymentsMadeMap, paymentsReceivedMap } =
    await buildFinancialMaps(groupId);

  return computeBalance({
    totalPaid: paidMap[userId] || 0,
    totalShare: shareMap[userId] || 0,
    totalPaymentsMade: paymentsMadeMap[userId] || 0,
    totalPaymentsReceived: paymentsReceivedMap[userId] || 0,
  });
};

module.exports = { getGroupBalances, calculateUserGroupBalance };
