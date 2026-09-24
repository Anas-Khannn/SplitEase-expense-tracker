const Joi = require("joi");

const createGroupSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    "string.min": "Group name must be at least 2 characters long",
    "string.max": "Group name must not exceed 100 characters",
    "any.required": "Group name is required",
    "string.empty": "Group name is not allowed to be empty",
  }),
  icon: Joi.string().max(100).allow(null, "").optional().messages({
    "string.max": "Icon must not exceed 100 characters",
  }),
  description: Joi.string().max(255).allow(null, "").optional().messages({
    "string.max": "Description must not exceed 255 characters",
  }),
});

const addMemberSchema = Joi.object({
  user_id: Joi.string().uuid().messages({
    "string.uuid": "Please provide a valid user ID",
  }),
  identifier: Joi.string().trim().lowercase().min(3).max(150).messages({
    "string.min": "Username or email must be at least 3 characters long",
    "string.max": "Username or email must not exceed 150 characters",
  }),
}).custom((value, helpers) => {
  if (value.user_id && value.identifier) {
    return helpers.message("Provide either a user ID or an email/username, not both");
  }

  if (!value.user_id && !value.identifier) {
    return helpers.message("Provide a user email or username");
  }

  if (value.identifier) {
    if (value.identifier.includes("@")) {
      if (Joi.string().email().validate(value.identifier).error) {
        return helpers.message("Please provide a valid email address");
      }
    } else if (!/^[a-z0-9._-]{3,30}$/.test(value.identifier)) {
      return helpers.message(
        "Username must be 3-30 characters (letters, numbers, dots, dashes, or underscores)",
      );
    }
  }

  return value;
});

const updateMemberRoleSchema = Joi.object({
  role: Joi.string().valid("admin", "member").required().messages({
    "any.only": "Role must be either 'admin' or 'member'",
    "any.required": "Role is required",
    "string.empty": "Role is not allowed to be empty",
  }),
});

const userIdParamsSchema = Joi.object({
  userId: Joi.string().uuid().required().messages({
    "string.uuid": "Please provide a valid user ID",
    "any.required": "User ID is required",
  }),
});

module.exports = {
  createGroupSchema,
  addMemberSchema,
  updateMemberRoleSchema,
  userIdParamsSchema,
};
