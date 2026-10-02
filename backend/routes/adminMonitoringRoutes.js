const express = require("express");

const router = express.Router();

const {
  getAdminActivityLogs,
  getActivityLogSummary,
  getActivityLogById,
} = require("../controllers/adminMonitoringController");

// ============================================
// GET ADMIN ACTIVITY LOGS
// ============================================
// Supports filters:
// action
// role
// user_id
// search
// start_date
// end_date

router.get(
  "/activity-logs",
  getAdminActivityLogs
);

// ============================================
// GET ACTIVITY LOG SUMMARY
// ============================================

router.get(
  "/activity-summary",
  getActivityLogSummary
);

// ============================================
// GET SINGLE ACTIVITY LOG
// ============================================

router.get(
  "/activity-logs/:id",
  getActivityLogById
);

module.exports = router;