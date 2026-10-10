
const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminOnly");

const {
  getAllAdminProjects,
} = require("../controllers/adminProjectController");

// All routes require authentication and admin privileges
router.use(authenticateToken);
router.use(adminOnly);

// GET /api/admin/projects
router.get("/projects", getAllAdminProjects);

module.exports = router;
