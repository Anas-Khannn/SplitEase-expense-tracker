const { User } = require("../database/models");
const { hashPassword, comparePassword } = require("../utils/password");
const { generateToken } = require("../utils/jwt");
const { formatUser } = require("../utils/user.utils");
const { ConflictError, UnauthorizedError, NotFoundError } = require("../errors");

const signup = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ where: { email } });

  if (existingUser) {
    throw new ConflictError("A user with this email already exists");
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
    throw new UnauthorizedError("Invalid email or password");
  }

  const isPasswordValid = await comparePassword(password, user.password_hash);

  if (!isPasswordValid) {
    throw new UnauthorizedError("Invalid email or password");
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
    throw new NotFoundError("User not found");
  }

  return formatUser(user);
};

module.exports = {
  signup,
  login,
  getMe,
};
