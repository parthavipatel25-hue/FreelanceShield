const express = require("express");

const router = express.Router();

const {
  createNotification,
  getUserNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} = require("../controllers/notificationController");

// ============================================
// CREATE NOTIFICATION
// ============================================

router.post("/", createNotification);

// ============================================
// GET USER NOTIFICATIONS
// ============================================

router.get(
  "/user/:user_id",
  getUserNotifications
);

// ============================================
// GET UNREAD COUNT
// ============================================

router.get(
  "/user/:user_id/unread-count",
  getUnreadNotificationCount
);

// ============================================
// MARK SINGLE NOTIFICATION AS READ
// ============================================

router.put(
  "/:id/read",
  markNotificationAsRead
);

// ============================================
// MARK ALL NOTIFICATIONS AS READ
// ============================================

router.put(
  "/user/:user_id/read-all",
  markAllNotificationsAsRead
);

// ============================================
// DELETE NOTIFICATION
// ============================================

router.delete(
  "/:id",
  deleteNotification
);

module.exports = router;