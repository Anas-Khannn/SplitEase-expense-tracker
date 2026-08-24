const Joi = require("joi");

const createExpenseSchema = Joi.object({
  amount: Joi.number().positive().precision(2).required().messages({
    "number.base": "Amount must be a number",
    "number.positive": "Amount must be greater than zero",
    "any.required": "Amount is required",
  }),
  description: Joi.string().min(1).max(255).required().messages({
    "string.min": "Description must not be empty",
    "string.max": "Description must not exceed 255 characters",
    "any.required": "Description is required",
    "string.empty": "Description is not allowed to be empty",
  }),
  paid_by: Joi.string().uuid().required().messages({
    "string.uuid": "Please provide a valid user ID for paid_by",
    "any.required": "paid_by is required",
  }),
  participant_ids: Joi.array()
    .items(Joi.string().uuid())
    .min(1)
    .required()
    .messages({
      "array.min": "At least one participant is required",
      "any.required": "participant_ids is required",
      "string.uuid": "Each participant must be a valid user ID",
    }),
  expense_date: Joi.date().iso().required().messages({
    "date.base": "Please provide a valid date",
    "date.iso": "Date must be in ISO 8601 format (YYYY-MM-DD)",
    "any.required": "Expense date is required",
  }),
});

const updateExpenseSchema = Joi.object({
  amount: Joi.number().positive().precision(2).optional().messages({
    "number.base": "Amount must be a number",
    "number.positive": "Amount must be greater than zero",
  }),
  description: Joi.string().min(1).max(255).optional().messages({
    "string.min": "Description must not be empty",
    "string.max": "Description must not exceed 255 characters",
  }),
  paid_by: Joi.string().uuid().optional().messages({
    "string.uuid": "Please provide a valid user ID for paid_by",
  }),
  participant_ids: Joi.array()
    .items(Joi.string().uuid())
    .min(1)
    .optional()
    .messages({
      "array.min": "At least one participant is required",
      "string.uuid": "Each participant must be a valid user ID",
    }),
  expense_date: Joi.date().iso().optional().messages({
    "date.base": "Please provide a valid date",
    "date.iso": "Date must be in ISO 8601 format (YYYY-MM-DD)",
  }),
}).min(1).messages({
  "object.min": "At least one field must be provided for update",
});

const getExpensesQuerySchema = Joi.object({
  payer_id: Joi.string().uuid().optional().messages({
    "string.uuid": "Please provide a valid user ID for payer_id",
  }),
  start_date: Joi.date().iso().optional().messages({
    "date.base": "Please provide a valid date",
    "date.iso": "Date must be in ISO 8601 format (YYYY-MM-DD)",
  }),
  end_date: Joi.date().iso().optional().messages({
    "date.base": "Please provide a valid date",
    "date.iso": "Date must be in ISO 8601 format (YYYY-MM-DD)",
  }),
  page: Joi.number().integer().min(1).default(1).messages({
    "number.base": "Page must be a number",
    "number.integer": "Page must be an integer",
    "number.min": "Page must be greater than or equal to 1",
  }),
  limit: Joi.number().integer().min(1).max(100).default(20).messages({
    "number.base": "Limit must be a number",
    "number.integer": "Limit must be an integer",
    "number.min": "Limit must be greater than or equal to 1",
    "number.max": "Limit must not exceed 100",
  }),
})
  .custom((value, helpers) => {
    if (
      value.start_date &&
      value.end_date &&
      new Date(value.start_date) > new Date(value.end_date)
    ) {
      return helpers.error("any.invalid");
    }
    return value;
  })
  .messages({
    "any.invalid": "start_date must be less than or equal to end_date",
  });

module.exports = {
  createExpenseSchema,
  updateExpenseSchema,
  getExpensesQuerySchema,
};
