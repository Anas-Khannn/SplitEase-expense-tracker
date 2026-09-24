const notificationService = require("../services/notification.service");
const HTTP_STATUSES = require("../constants/http-statuses");
const asyncHandler = require("../middlewares/async-handler.middleware");

const listNotifications = asyncHandler(async (req, res) => {
  const result = await notificationService.listNotifications(
    req.user.user_id,
    req.query,
  );

  return res.status(HTTP_STATUSES.OK).json({
    success: true,
    data: result,
  });
});

const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await notificationService.getUnreadCount(req.user.user_id);

  return res.status(HTTP_STATUSES.OK).json({
    success: true,
    data: { count },
  });
});

const markRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markRead(
    req.user.user_id,
    req.params.notificationId,
  );

  return res.status(HTTP_STATUSES.OK).json({
    success: true,
    data: { notification },
  });
});

const markAllRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAllRead(req.user.user_id);

  return res.status(HTTP_STATUSES.OK).json({
    success: true,
    message: result.message,
  });
});

const getPreferences = asyncHandler(async (req, res) => {
  const preferences = await notificationService.getPreferences(req.user.user_id);

  return res.status(HTTP_STATUSES.OK).json({
    success: true,
    data: { preferences },
  });
});

const updatePreferences = asyncHandler(async (req, res) => {
  const preferences = await notificationService.updatePreferences(
    req.user.user_id,
    req.body,
  );

  return res.status(HTTP_STATUSES.OK).json({
    success: true,
    data: { preferences },
  });
});

const streamNotifications = asyncHandler(async (req, res) => {
  const sse = require("../sse/notification-sse");

  sse.setSSEHeaders(res);

  sse.addClient(req.user.user_id, res);

  req.on("close", () => {
    sse.removeClient(req.user.user_id, res);
  });
});

module.exports = {
  listNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
  getPreferences,
  updatePreferences,
  streamNotifications,
};