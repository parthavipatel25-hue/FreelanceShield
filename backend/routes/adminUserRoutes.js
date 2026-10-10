const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminOnly");

const {
  getAllUsers,
  updateUserStatus,
} = require("../controllers/adminUserController");

router.use(authenticateToken, adminOnly);

router.get("/users", getAllUsers);
router.put("/users/:id/status", updateUserStatus);

module.exports = router;