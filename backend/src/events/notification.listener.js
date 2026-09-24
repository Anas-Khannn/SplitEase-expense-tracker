const eventBus = require("./event-bus");
const EVENTS = require("./events");
const NOTIFICATION_TYPES = require("../constants/notification-types");
const {
  createNotification,
  PREFERENCE_KEY_BY_TYPE,
} = require("../services/notification.service");

const mapEventToType = (eventName) => {
  switch (eventName) {
    case EVENTS.MEMBER_ADDED:
      return NOTIFICATION_TYPES.MEMBER_ADDED;
    case EVENTS.MEMBER_REMOVED:
      return NOTIFICATION_TYPES.MEMBER_REMOVED;
    case EVENTS.MEMBER_ROLE_CHANGED:
      return NOTIFICATION_TYPES.MEMBER_ROLE_CHANGED;
    case EVENTS.EXPENSE_CREATED:
      return NOTIFICATION_TYPES.EXPENSE_CREATED;
    case EVENTS.EXPENSE_UPDATED:
      return NOTIFICATION_TYPES.EXPENSE_UPDATED;
    case EVENTS.EXPENSE_DELETED:
      return NOTIFICATION_TYPES.EXPENSE_DELETED;
    case EVENTS.PAYMENT_CREATED:
      return NOTIFICATION_TYPES.PAYMENT_CREATED;
    case EVENTS.REACTION_ADDED:
      return NOTIFICATION_TYPES.REACTION_ADDED;
    default:
      return null;
  }
};

const consume = async (eventName, data) => {
  const type = mapEventToType(eventName);
  if (!type) return;

  const { targetUserId, recipientIds, ...payload } = data;

  const recipients = recipientIds
    ? recipientIds.filter((id) => id !== payload.actorUserId)
    : targetUserId
      ? [targetUserId]
      : [];

  if (recipients.length === 0) {
    return;
  }

  for (const userId of new Set(recipients)) {
    await createNotification(userId, {
      type,
      title: payload.title || type.replace(/_/g, " ").toLowerCase(),
      message: payload.message || "",
      reference_type: payload.referenceType || "group",
      reference_id: payload.referenceId || payload.groupId || null,
    });
  }
};

let registered = false;

const registerNotificationListeners = () => {
  if (registered) return;
  registered = true;

  for (const eventName of Object.values(EVENTS)) {
    eventBus.on(eventName, (data) => {
      consume(eventName, data).catch((err) => {
        console.error(`[notifications] failed to consume ${eventName}:`, err);
      });
    });
  }
};

module.exports = {
  registerNotificationListeners,
  mapEventToType,
  consume,
  PREFERENCE_KEY_BY_TYPE,
};