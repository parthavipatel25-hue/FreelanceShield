const express = require("express");
const router = express.Router();
const {
  createProject,
  getClientProjects,
  getProjectById,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");

// ============================================
// CREATE PROJECT
// ============================================

router.post("/", createProject);
router.get("/:id", getProjectById);

// ============================================
// GET CLIENT PROJECTS
// ============================================

router.get("/client/:user_id", getClientProjects);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);

module.exports = router;