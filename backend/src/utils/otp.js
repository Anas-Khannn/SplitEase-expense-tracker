const crypto = require("crypto");

const OTP_LENGTH = 6;

const generateOtp = () =>
  String(crypto.randomInt(0, 10 ** OTP_LENGTH)).padStart(OTP_LENGTH, "0");

const otpMatches = (provided, stored) => {
  if (typeof provided !== "string" || typeof stored !== "string") {
    return false;
  }

  const a = Buffer.from(provided);
  const b = Buffer.from(stored);

  if (a.length !== b.length) {
    return false;
  }

  return crypto.timingSafeEqual(a, b);
};

module.exports = {
  OTP_LENGTH,
  generateOtp,
  otpMatches,
};