const { AppError } = require("../errors");
const HTTP_STATUSES = require("../constants/http-statuses");

const errorHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  console.error("Unhandled error:", err);

  return res.status(HTTP_STATUSES.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: "Internal server error",
  });
};

module.exports = errorHandler;
