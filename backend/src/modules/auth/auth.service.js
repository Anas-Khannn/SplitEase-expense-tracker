const { User } = require("../../database/models");
const { hashPassword, comparePassword } = require("../../utils/password");
const { generateToken } = require("../../utils/jwt");

const safeUserFields = ["user_id", "name", "email", "created_at", "updated_at"];

const formatUser = (user) => {
  const data = user.toJSON ? user.toJSON() : user;
  const safe = {};
  safeUserFields.forEach((field) => {
    safe[field] = data[field];
  });
  return safe;
};

const signup = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ where: { email } });

  if (existingUser) {
    const error = new Error("A user with this email already exists");
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await hashPassword(password);

  const user = await User.create({
    name,
    email,
    password_hash: passwordHash,
  });

  const token = generateToken({ user_id: user.user_id });

  return {
    user: formatUser(user),
    token,
  };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });

  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await comparePassword(password, user.password_hash);

  if (!isPasswordValid) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken({ user_id: user.user_id });

  return {
    user: formatUser(user),
    token,
  };
};

const getMe = async (userId) => {
  const user = await User.findByPk(userId);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return formatUser(user);
};

module.exports = {
  signup,
  login,
  getMe,
};
