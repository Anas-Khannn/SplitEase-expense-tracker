const HTTP_STATUSES = require("../constants/http-statuses");

const validate = (schema, property = "body") => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
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

    if (property === "query") {
      req.validatedQuery = value;
    }

    next();
  };
};

module.exports = validate;
