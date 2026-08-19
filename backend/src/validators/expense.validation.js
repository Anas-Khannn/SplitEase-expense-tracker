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

module.exports = {
  createExpenseSchema,
  updateExpenseSchema,
};
