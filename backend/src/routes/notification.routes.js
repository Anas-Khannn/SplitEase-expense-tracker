const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notification.controller");
const authenticate = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const {
  readNotificationParamsSchema,
  updatePreferencesSchema,
} = require("../validators/notification.validation");

router.use(authenticate);

router.get("/", notificationController.listNotifications);
router.get("/stream", notificationController.streamNotifications);
router.get("/unread-count", notificationController.getUnreadCount);
router.get("/preferences", notificationController.getPreferences);
router.put(
  "/preferences",
  validate(updatePreferencesSchema),
  notificationController.updatePreferences,
);
router.patch("/read-all", notificationController.markAllRead);
router.patch(
  "/:notificationId/read",
  validate(readNotificationParamsSchema, "params"),
  notificationController.markRead,
);

module.exports = router;
