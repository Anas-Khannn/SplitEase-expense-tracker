const { Notification, NotificationPreference } = require("../database/models");
const { parsePagination } = require("../utils/pagination.utils");
const { NotFoundError } = require("../errors");
const { broadcast } = require("../sse/notification-sse");

const DEFAULT_PREFERENCES = {
  expenses: true,
  settlements: true,
  members: true,
  reactions: true,
};

const PREFERENCE_KEY_BY_TYPE = {
  MEMBER_ADDED: "members",
  MEMBER_REMOVED: "members",
  MEMBER_ROLE_CHANGED: "members",
  EXPENSE_CREATED: "expenses",
  EXPENSE_UPDATED: "expenses",
  EXPENSE_DELETED: "expenses",
  PAYMENT_CREATED: "settlements",
  REACTION_ADDED: "reactions",
};

const isEnabled = (prefs, type) => {
  const key = PREFERENCE_KEY_BY_TYPE[type];
  if (!key) return true;
  if (!prefs) return true;
  return prefs[key] !== false;
};

const formatNotification = (notification) => ({
  notification_id: notification.notification_id,
  user_id: notification.user_id,
  type: notification.type,
  title: notification.title,
  message: notification.message,
  reference_type: notification.reference_type,
  reference_id: notification.reference_id,
  is_read: notification.is_read,
  created_at: notification.created_at,
});

const createNotification = async (userId, data) => {
  const prefs = await NotificationPreference.findByPk(userId);

  if (!isEnabled(prefs, data.type)) {
    return null;
  }

  const notification = await Notification.create({
    user_id: userId,
    type: data.type,
    title: data.title,
    message: data.message,
    reference_type: data.reference_type || null,
    reference_id: data.reference_id || null,
  });

  const payload = formatNotification(notification);

  broadcast(userId, {
    event: "notification",
    data: payload,
  });

  return notification;
};

const listNotifications = async (userId, query = {}) => {
  const { page, limit } = parsePagination(query);
  const offset = (page - 1) * limit;

  const { count, rows } = await Notification.findAndCountAll({
    where: { user_id: userId },
    order: [["created_at", "DESC"]],
    limit,
    offset,
  });

  return {
    notifications: rows.map(formatNotification),
    pagination: {
      page,
      limit,
      total: count,
      total_pages: Math.ceil(count / limit),
    },
  };
};

const getUnreadCount = async (userId) =>
  Notification.count({ where: { user_id: userId, is_read: false } });

const markRead = async (userId, notificationId) => {
  const notification = await Notification.findOne({
    where: { notification_id: notificationId, user_id: userId },
  });

  if (!notification) {
    throw new NotFoundError("Notification not found");
  }

  await notification.update({ is_read: true });

  return formatNotification(notification);
};

const markAllRead = async (userId) => {
  await Notification.update({ is_read: true }, { where: { user_id: userId, is_read: false } });

  return { message: "All notifications marked as read" };
};

const getPreferences = async (userId) => {
  const prefs = await NotificationPreference.findByPk(userId);

  if (!prefs) {
    return { ...DEFAULT_PREFERENCES };
  }

  return {
    expenses: prefs.expenses,
    settlements: prefs.settlements,
    members: prefs.members,
    reactions: prefs.reactions,
  };
};

const updatePreferences = async (userId, data) => {
  const [prefs] = await NotificationPreference.findOrCreate({
    where: { user_id: userId },
    defaults: { ...DEFAULT_PREFERENCES },
  });

  await prefs.update(data);

  return {
    expenses: prefs.expenses,
    settlements: prefs.settlements,
    members: prefs.members,
    reactions: prefs.reactions,
  };
};

module.exports = {
  createNotification,
  listNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
  getPreferences,
  updatePreferences,
  formatNotification,
};
