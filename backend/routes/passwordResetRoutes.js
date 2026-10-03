const express = require("express");

const router = express.Router();

const {
  verifyResetToken,
  resetPassword,
} = require("../controllers/passwordResetController");

// Verify token
router.get(
  "/verify",
  verifyResetToken
);

// Change password
router.post(
  "/reset",
  resetPassword
);

module.exports = router;