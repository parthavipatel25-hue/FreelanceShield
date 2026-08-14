const express = require("express");
const router = express.Router();

const {
  createProject,
  getClientProjects,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");

// ============================================
// CREATE PROJECT
// ============================================

router.post("/", createProject);

// ============================================
// GET ALL AVAILABLE PROJECTS
// Used by freelancers to browse client projects
// ============================================

router.get("/", getAllProjects);

// ============================================
// GET CLIENT PROJECTS
// ============================================

router.get("/client/:user_id", getClientProjects);

// ============================================
// GET SINGLE PROJECT
// ============================================

router.get("/:id", getProjectById);

// ============================================
// UPDATE PROJECT
// ============================================

router.put("/:id", updateProject);

// ============================================
// DELETE PROJECT
// ============================================

router.delete("/:id", deleteProject);

module.exports = router;