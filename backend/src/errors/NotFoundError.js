const HTTP_STATUSES = require("../constants/http-statuses");
const AppError = require("./AppError");

class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, HTTP_STATUSES.NOT_FOUND);
  }
}

module.exports = NotFoundError;
