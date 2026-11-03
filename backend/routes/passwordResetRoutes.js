
const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminOnly");

const {
  requestPasswordReset,
  checkPasswordResetStatus,
  getPasswordResetRequests,
  approvePasswordResetRequest,
  rejectPasswordResetRequest,
  resetPassword,
} = require("../controllers/passwordResetController");

// ======================================================
// PUBLIC ROUTES
// ======================================================

// Submit a password-reset request.
router.post("/request", requestPasswordReset);

// Check request status using the secret tracking code.
router.post("/status", checkPasswordResetStatus);

// Reset password using an approved reset token.
router.post("/reset-password", resetPassword);

// ======================================================
// ADMIN-ONLY ROUTES
// ======================================================

router.use("/admin", authenticateToken, adminOnly);

// Get all requests or filter by status.
router.get("/admin/requests", getPasswordResetRequests);

// Approve a pending request.
router.post(
  "/admin/requests/:id/approve",
  approvePasswordResetRequest
);

// Reject a pending request.
router.post(
  "/admin/requests/:id/reject",
  rejectPasswordResetRequest
);

module.exports = router;
