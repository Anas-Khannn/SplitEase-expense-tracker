const HTTP_STATUSES = require("../constants/http-statuses");

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((detail) => detail.message);
      return res.status(HTTP_STATUSES.BAD_REQUEST).json({
        success: false,
        message: "Validation failed",
        errors: messages,
      });
    }

    next();
  };
};

module.exports = validate;
