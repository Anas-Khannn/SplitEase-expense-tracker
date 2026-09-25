const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const authenticate = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const { searchUsersQuerySchema } = require("../validators/user.validation");

router.get(
  "/search",
  authenticate,
  validate(searchUsersQuerySchema, "query"),
  userController.searchUsers,
);

module.exports = router;
