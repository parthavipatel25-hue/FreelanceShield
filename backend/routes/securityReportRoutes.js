const express = require("express");

const router = express.Router();

const {
  createSecurityReport,
  getSecurityReports,
  getSecurityReportById,
  updateSecurityReportStatus,
  getSecurityReportSummary,
} = require("../controllers/securityReportController");

// ============================================
// CREATE SECURITY REPORT
// ============================================

router.post(
  "/",
  createSecurityReport
);

// ============================================
// GET ALL SECURITY REPORTS
// ============================================

router.get(
  "/",
  getSecurityReports
);

// ============================================
// GET SECURITY REPORT SUMMARY
// ============================================

router.get(
  "/summary",
  getSecurityReportSummary
);

// ============================================
// GET SECURITY REPORT BY ID
// ============================================

router.get(
  "/:id",
  getSecurityReportById
);

// ============================================
// UPDATE SECURITY REPORT STATUS
// ============================================

router.put(
  "/:id/status",
  updateSecurityReportStatus
);

module.exports = router;