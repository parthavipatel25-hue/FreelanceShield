const express = require("express");
const router = express.Router();

const {
  submitVerificationRequest,
  getVerificationStatus,
  getPendingVerificationRequests,
  approveVerificationRequest,
  rejectVerificationRequest,
} = require("../controllers/userVerificationController");

// ============================================
// USER VERIFICATION
// ============================================

// Submit / resubmit verification request
router.post("/request", submitVerificationRequest);

// Get verification status for a user
router.get("/status/:user_id", getVerificationStatus);

// ============================================
// ADMIN VERIFICATION REVIEW
// ============================================

// Get all pending verification requests
router.get("/admin/pending", getPendingVerificationRequests);

// Approve verification request
router.put("/admin/:id/approve", approveVerificationRequest);

// Reject verification request
router.put("/admin/:id/reject", rejectVerificationRequest);

module.exports = router;