const HTTP_STATUSES = require("../constants/http-statuses");
const AppError = require("./app.error");

class BadRequestError extends AppError {
  constructor(message = "Bad request") {
    super(message, HTTP_STATUSES.BAD_REQUEST);
  }
}

module.exports = BadRequestError;
