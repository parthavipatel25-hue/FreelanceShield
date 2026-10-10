
const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminOnly");

const {
  getAllReports,
  createReport,
   updateReportStatus,
} = require("../controllers/reportController");

// POST /api/reports
// Any authenticated user can submit a report.

console.log("authenticateToken:", typeof authenticateToken);
console.log("createReport:", typeof createReport);
router.post(
  "/reports",
  authenticateToken,
  createReport
);

// GET /api/admin/reports
// Only authenticated admins can view reports.
router.get(
  "/admin/reports",
  authenticateToken,
  adminOnly,
  getAllReports
);

router.patch(
  "/admin/reports/:id/status",
  authenticateToken,
  adminOnly,
  updateReportStatus
);

module.exports = router;
