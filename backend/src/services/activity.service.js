const { ActivityLog, User } = require("../database/models");

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
    options
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

const formatActivityResponse = (activity) => ({
  activity_id: activity.activity_id,
  group_id: activity.group_id,
  user: activity.user
    ? {
        user_id: activity.user.user_id,
        name: activity.user.name,
        email: activity.user.email,
      }
    : undefined,
  action: activity.action,
  description: activity.description,
  created_at: activity.created_at,
});

module.exports = { logActivity, getGroupActivities };
