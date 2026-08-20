const Joi = require("joi");

const createPaymentSchema = Joi.object({
  paid_to: Joi.string().uuid().required().messages({
    "string.uuid": "Please provide a valid user ID for paid_to",
    "any.required": "paid_to is required",
  }),
  amount: Joi.number().positive().precision(2).required().messages({
    "number.base": "Amount must be a number",
    "number.positive": "Amount must be greater than zero",
    "any.required": "Amount is required",
  }),
  note: Joi.string().max(255).optional().allow("", null).messages({
    "string.max": "Note must not exceed 255 characters",
  }),
  payment_date: Joi.date().iso().required().messages({
    "date.base": "Please provide a valid date",
    "date.iso": "Date must be in ISO 8601 format (YYYY-MM-DD)",
    "any.required": "Payment date is required",
  }),
});

module.exports = { createPaymentSchema };
