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

module.exports = { formatPaymentResponse };
