const MAX_USERNAME_LENGTH = 30;

const sanitizeUsername = (raw) =>
  String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "")
    .replace(/^[._-]+|[._-]+$/g, "")
    .slice(0, MAX_USERNAME_LENGTH);

const usernameFromEmail = (email) => {
  const localPart = String(email || "").split("@")[0];
  const sanitized = sanitizeUsername(localPart);
  return sanitized || "user";
};

module.exports = { sanitizeUsername, usernameFromEmail, MAX_USERNAME_LENGTH };