const expenseService = require("../services/expense.service");
const HTTP_STATUSES = require("../constants/http-statuses");

const createExpense = async (req, res, next) => {
  try {
    const result = await expenseService.createExpense(
      req.params.groupId,
      req.body,
      req.user.user_id
    );

    return res.status(HTTP_STATUSES.CREATED).json({
      success: true,
      message: "Expense created successfully",
      data: { expense: result },
    });
  } catch (error) {
    next(error);
  }
};

const getExpensesByGroup = async (req, res, next) => {
  try {
    const filters = req.validatedQuery || {};
    const { expenses, pagination } = await expenseService.getExpensesByGroup(
      req.params.groupId,
      filters
    );

    return res.status(HTTP_STATUSES.OK).json({
      success: true,
      data: { expenses, pagination },
    });
  } catch (error) {
    next(error);
  }
};

const getExpenseById = async (req, res, next) => {
  try {
    const expense = await expenseService.getExpenseById(
      req.params.groupId,
      req.params.expenseId
    );

    return res.status(HTTP_STATUSES.OK).json({
      success: true,
      data: { expense },
    });
  } catch (error) {
    next(error);
  }
};

const updateExpense = async (req, res, next) => {
  try {
    const result = await expenseService.updateExpense(
      req.params.groupId,
      req.params.expenseId,
      req.body,
      req.user.user_id
    );

    return res.status(HTTP_STATUSES.OK).json({
      success: true,
      message: "Expense updated successfully",
      data: { expense: result },
    });
  } catch (error) {
    next(error);
  }
};

const deleteExpense = async (req, res, next) => {
  try {
    const result = await expenseService.deleteExpense(
      req.params.groupId,
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
  createExpense,
  getExpensesByGroup,
  getExpenseById,
  updateExpense,
  deleteExpense,
};
