const Joi = require("joi");

const readNotificationParamsSchema = Joi.object({
  notificationId: Joi.string().uuid().required().messages({
    "string.uuid": "Please provide a valid notification ID",
    "any.required": "Notification ID is required",
  }),
});

const updatePreferencesSchema = Joi.object({
  expenses: Joi.boolean().messages({
    "boolean.base": "expenses must be a boolean",
  }),
  settlements: Joi.boolean().messages({
    "boolean.base": "settlements must be a boolean",
  }),
  members: Joi.boolean().messages({
    "boolean.base": "members must be a boolean",
  }),
  reactions: Joi.boolean().messages({
    "boolean.base": "reactions must be a boolean",
  }),
}).min(1).messages({
  "object.min": "Provide at least one preference to update",
});

module.exports = {
  readNotificationParamsSchema,
  updatePreferencesSchema,
};