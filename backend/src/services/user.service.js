const { Op } = require("sequelize");
const { User } = require("../database/models");
const { sequelize } = require("../database/models");

const searchUsers = async (query, { excludeUserId, limit = 20 } = {}) => {
  const q = String(query || "")
    .trim()
    .toLowerCase();

  if (q.length < 2) {
    return [];
  }

  const likeOperator = sequelize.getDialect() === "postgres" ? Op.iLike : Op.like;

  const users = await User.findAll({
    where: {
      [Op.or]: [
        { name: { [likeOperator]: `%${q}%` } },
        { email: { [likeOperator]: `%${q}%` } },
        { username: { [likeOperator]: `%${q}%` } },
      ],
      ...(excludeUserId ? { user_id: { [Op.ne]: excludeUserId } } : {}),
    },
    attributes: ["user_id", "name", "email", "username"],
    limit,
    order: [["name", "ASC"]],
  });

  return users.map((u) => ({
    user_id: u.user_id,
    name: u.name,
    email: u.email,
    username: u.username,
  }));
};

module.exports = { searchUsers };
