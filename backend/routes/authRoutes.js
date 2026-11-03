
const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authMiddleware");

const {
  register,
  login,
  forceChangePassword,
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);

// Protected forced password change
router.put(
  "/force-change-password",
  authenticateToken,
  forceChangePassword
);

module.exports = router;
