const HTTP_STATUSES = require("../constants/http-statuses");
const AppError = require("./AppError");

class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, HTTP_STATUSES.FORBIDDEN);
  }
}

module.exports = ForbiddenError;
