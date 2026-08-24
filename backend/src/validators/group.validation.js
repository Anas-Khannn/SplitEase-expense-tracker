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
  user_id: Joi.string().uuid().required().messages({
    "string.uuid": "Please provide a valid user ID",
    "any.required": "User ID is required",
  }),
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
