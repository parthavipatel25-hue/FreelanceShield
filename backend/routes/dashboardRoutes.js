const express = require("express");

const {
  getAdminDashboardStats,
} = require("../controllers/dashboardController");

const router = express.Router();

// Admin dashboard statistics
router.get(
  "/dashboard-stats",
  getAdminDashboardStats
);

module.exports = router;