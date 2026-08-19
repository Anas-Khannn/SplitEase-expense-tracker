const HTTP_STATUSES = require("../constants/http-statuses");
const AppError = require("./AppError");

class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, HTTP_STATUSES.UNAUTHORIZED);
  }
}

module.exports = UnauthorizedError;
