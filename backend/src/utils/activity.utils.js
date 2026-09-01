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

module.exports = { formatActivityResponse };
