const express = require("express");

const router = express.Router();

const {
  createActivityLog,
  getActivityLogs,
} = require("../controllers/activityLogController");

// ============================================
// CREATE ACTIVITY LOG
// ============================================

router.post("/", createActivityLog);

// ============================================
// GET ACTIVITY LOGS
// ============================================

router.get("/", getActivityLogs);

module.exports = router;