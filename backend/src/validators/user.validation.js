const Joi = require("joi");

const searchUsersQuerySchema = Joi.object({
  q: Joi.string().trim().min(2).max(100).required().messages({
    "string.min": "Search query must be at least 2 characters long",
    "any.required": "Search query is required",
    "string.empty": "Search query is not allowed to be empty",
  }),
});

module.exports = { searchUsersQuerySchema };