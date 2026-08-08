const express = require("express");

const router = express.Router();

const {
  getProfile,
  updateProfile,
  changePassword,
} = require("../controllers/profileController");

// ================= PROFILE =================

// Get User Profile
router.get("/:id", getProfile);

// Update User Profile
router.put("/:id", updateProfile);

// Change Password
router.put("/:id/password", changePassword);

module.exports = router;