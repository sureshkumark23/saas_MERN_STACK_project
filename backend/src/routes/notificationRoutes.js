const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  getMyNotifications,
  markAsRead,
} = require("../controllers/notificationController");

const router = express.Router();

/**
 * GET MY NOTIFICATIONS
 * GET /api/notifications
 */
router.get(
  "/notifications",
  authMiddleware,
  getMyNotifications
);

/**
 * MARK NOTIFICATION AS READ
 * PATCH /api/notifications/:notificationId/read
 */
router.patch(
  "/notifications/:notificationId/read",
  authMiddleware,
  markAsRead
);

module.exports = router;
