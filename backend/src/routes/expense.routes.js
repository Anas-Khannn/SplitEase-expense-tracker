const express = require("express");
const router = express.Router({ mergeParams: true });
const expenseController = require("../controllers/expense.controller");
const authenticate = require("../middlewares/auth.middleware");
const {
  authorizeGroupMember,
} = require("../middlewares/group.middleware");
const validate = require("../middlewares/validate.middleware");
const {
  createExpenseSchema,
  updateExpenseSchema,
} = require("../validators/expense.validation");

router.post(
  "/",
  authenticate,
  authorizeGroupMember,
  validate(createExpenseSchema),
  expenseController.createExpense
);

router.get(
  "/",
  authenticate,
  authorizeGroupMember,
  expenseController.getExpensesByGroup
);

router.get(
  "/:expenseId",
  authenticate,
  authorizeGroupMember,
  expenseController.getExpenseById
);

router.put(
  "/:expenseId",
  authenticate,
  authorizeGroupMember,
  validate(updateExpenseSchema),
  expenseController.updateExpense
);

router.delete(
  "/:expenseId",
  authenticate,
  authorizeGroupMember,
  expenseController.deleteExpense
);

module.exports = router;
