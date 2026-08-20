const {
  Group,
  GroupMember,
  Payment,
  User,
} = require("../database/models");
const { sequelize } = require("../database/models");
const {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} = require("../errors");

const getGroupBalances = require("./balance.service").getGroupBalances;

const createPayment = async (groupId, payerId, { paid_to, amount, note, payment_date }) => {
  const group = await Group.findByPk(groupId);
  if (!group) {
    throw new NotFoundError("Group not found");
  }

  const payerMembership = await GroupMember.findOne({
    where: { group_id: groupId, user_id: payerId },
  });

  if (!payerMembership) {
    throw new ForbiddenError("You are not a member of this group");
  }

  if (payerId === paid_to) {
    throw new BadRequestError("Cannot make a payment to yourself");
  }

  const receiver = await User.findByPk(paid_to);
  if (!receiver) {
    throw new NotFoundError("Receiver user not found");
  }

  const receiverMembership = await GroupMember.findOne({
    where: { group_id: groupId, user_id: paid_to },
  });

  if (!receiverMembership) {
    throw new ForbiddenError("Receiver is not a member of this group");
  }

  const balances = await getGroupBalances(groupId);
  const payerBalance = balances.find((b) => b.user_id === payerId);
  const receiverBalance = balances.find((b) => b.user_id === paid_to);

  if (payerBalance && payerBalance.balance >= 0) {
    throw new BadRequestError(
      "You do not owe any money to this user in this group"
    );
  }

  if (receiverBalance && receiverBalance.balance <= 0) {
    throw new BadRequestError(
      "This user is not owed any money in this group"
    );
  }

  const payment = await sequelize.transaction(async (t) => {
    const newPayment = await Payment.create(
      {
        group_id: groupId,
        paid_by: payerId,
        paid_to,
        amount,
        note: note || null,
        payment_date,
      },
      { transaction: t }
    );

    return newPayment;
  });

  const fullPayment = await Payment.findByPk(payment.payment_id, {
    include: [
      {
        model: User,
        as: "payer",
        attributes: ["user_id", "name", "email"],
      },
      {
        model: User,
        as: "receiver",
        attributes: ["user_id", "name", "email"],
      },
    ],
  });

  return formatPaymentResponse(fullPayment);
};

const getPaymentsByGroup = async (groupId) => {
  const group = await Group.findByPk(groupId);
  if (!group) {
    throw new NotFoundError("Group not found");
  }

  const payments = await Payment.findAll({
    where: { group_id: groupId },
    include: [
      {
        model: User,
        as: "payer",
        attributes: ["user_id", "name", "email"],
      },
      {
        model: User,
        as: "receiver",
        attributes: ["user_id", "name", "email"],
      },
    ],
    order: [["created_at", "DESC"]],
  });

  return payments.map(formatPaymentResponse);
};

const formatPaymentResponse = (payment) => ({
  payment_id: payment.payment_id,
  group_id: payment.group_id,
  amount: parseFloat(payment.amount).toFixed(2),
  note: payment.note,
  payment_date: payment.payment_date,
  created_at: payment.created_at,
  updated_at: payment.updated_at,
  payer: payment.payer
    ? {
        user_id: payment.payer.user_id,
        name: payment.payer.name,
        email: payment.payer.email,
      }
    : undefined,
  receiver: payment.receiver
    ? {
        user_id: payment.receiver.user_id,
        name: payment.receiver.name,
        email: payment.receiver.email,
      }
    : undefined,
});

module.exports = {
  createPayment,
  getPaymentsByGroup,
};
