const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const authenticate = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const {
  signupSchema,
  loginSchema,
  sendVerificationOtpSchema,
  verifyEmailSchema,
} = require("../validators/auth.validation");

router.post("/signup", validate(signupSchema), authController.signup);
router.post("/login", validate(loginSchema), authController.login);
router.post(
  "/send-verification-otp",
  validate(sendVerificationOtpSchema),
  authController.sendVerificationOtp,
);
router.post(
  "/verify-email",
  validate(verifyEmailSchema),
  authController.verifyEmail,
);
router.post("/logout", authenticate, authController.logout);
router.get("/me", authenticate, authController.getMe);

module.exports = router;
