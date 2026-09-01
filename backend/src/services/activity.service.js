const { ActivityLog, User } = require("../database/models");
const { formatActivityResponse } = require("../utils/activity.utils");

const logActivity = async (groupId, userId, action, description, transaction) => {
  const options = {};
  if (transaction) {
    options.transaction = transaction;
  }

  return ActivityLog.create(
    {
      group_id: groupId,
      user_id: userId,
      action,
      description,
    },
    options,
  );
};

const getGroupActivities = async (groupId, { page = 1, limit = 20 } = {}) => {
  const maxLimit = 100;
  const safeLimit = Math.min(Math.max(1, limit), maxLimit);
  const safePage = Math.max(1, page);
  const offset = (safePage - 1) * safeLimit;

  const { count, rows } = await ActivityLog.findAndCountAll({
    where: { group_id: groupId },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["user_id", "name", "email"],
      },
    ],
    order: [["created_at", "DESC"]],
    limit: safeLimit,
    offset,
  });

  return {
    activities: rows.map(formatActivityResponse),
    pagination: {
      page: safePage,
      limit: safeLimit,
      total: count,
      total_pages: Math.ceil(count / safeLimit),
    },
  };
};

module.exports = { logActivity, getGroupActivities };
