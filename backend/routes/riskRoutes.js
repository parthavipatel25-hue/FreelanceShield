const express = require("express");

const router = express.Router();

const {
  getAllRisks,
  getRiskById,
  createRisk,
  updateRiskStatus,
  deleteRisk,
  getRiskSummary,
} = require("../controllers/riskController");

// ============================================
// GET RISK SUMMARY
// ============================================

router.get("/summary", getRiskSummary);

// ============================================
// GET ALL RISKS
// ============================================

router.get("/", getAllRisks);

// ============================================
// GET SINGLE RISK
// ============================================

router.get("/:id", getRiskById);

// ============================================
// CREATE RISK
// ============================================

router.post("/", createRisk);

// ============================================
// UPDATE RISK STATUS
// ============================================

router.put("/:id/status", updateRiskStatus);

// ============================================
// DELETE RISK
// ============================================

router.delete("/:id", deleteRisk);

module.exports = router;