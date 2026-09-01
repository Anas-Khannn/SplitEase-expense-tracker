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

const toDateOnly = (date) => (date instanceof Date ? date.toISOString().split("T")[0] : date);

module.exports = { formatExpenseResponse, formatSplitResponse, toDateOnly };
