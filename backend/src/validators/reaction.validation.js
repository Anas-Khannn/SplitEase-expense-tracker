const Joi = require("joi");
const { ALLOWED_REACTIONS } = require("../constants/reaction-types");

const addReactionSchema = Joi.object({
  reaction: Joi.string()
    .valid(...ALLOWED_REACTIONS)
    .required()
    .messages({
      "any.required": "Reaction is required",
      "any.only": "Reaction must be one of the supported values",
      "string.empty": "Reaction is not allowed to be empty",
    }),
});

module.exports = { addReactionSchema };
