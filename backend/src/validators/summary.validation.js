const Joi = require("joi");

const getSummaryQuerySchema = Joi.object({
  month: Joi.string()
    .pattern(/^\d{4}-(0[1-9]|1[0-2])$/)
    .optional()
    .messages({
      "string.base": "Month must be a string",
      "string.pattern.base": "Month must be in YYYY-MM format (e.g., 2026-08)",
    }),
});

module.exports = { getSummaryQuerySchema };
