
const express = require("express");

const {
  createNotification,
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} = require("../controllers/notificationController");

const requireAuth = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================
// Protect all Notification API endpoints
// =====================================

router.use(requireAuth);

// =====================================
// CREATE NOTIFICATION
// POST /api/notifications
// =====================================

router.post("/", createNotification);

// =====================================
// GET MY NOTIFICATIONS
// GET /api/notifications
//
// Optional query:
// ?scope=due
// ?scope=upcoming
// ?scope=all
// =====================================

router.get("/", getNotifications);

// =====================================
// GET UNREAD NOTIFICATION COUNT
// GET /api/notifications/unread-count
// =====================================

router.get("/unread-count", getUnreadCount);

// =====================================
// MARK ALL DUE NOTIFICATIONS AS READ
// PATCH /api/notifications/read-all
// =====================================

router.patch(
  "/read-all",
  markAllNotificationsRead
);

// =====================================
// MARK SINGLE NOTIFICATION AS READ
// PATCH /api/notifications/:id/read
// =====================================

router.patch(
  "/:id/read",
  markNotificationRead
);

// =====================================
// DELETE NOTIFICATION
// DELETE /api/notifications/:id
// =====================================

router.delete(
  "/:id",
  deleteNotification
);

// =====================================
// Export Router
// =====================================

module.exports = router;
