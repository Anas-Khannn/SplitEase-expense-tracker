const HTTP_STATUSES = require("../constants/http-statuses");
const AppError = require("./AppError");

class ConflictError extends AppError {
  constructor(message = "Conflict") {
    super(message, HTTP_STATUSES.CONFLICT);
  }
}

module.exports = ConflictError;
