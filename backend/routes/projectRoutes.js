const express = require("express");

const router = express.Router();

const {
  createProject,
  getClientProjects,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  updateProjectProgress,
  completeProject,
  searchProjects,
} = require("../controllers/projectController");

// ============================================
// CREATE PROJECT
// ============================================

router.post("/", createProject);

// ============================================
// GET ALL PROJECTS
// ============================================
// Used by freelancers to browse all projects

router.get("/", getAllProjects);

// ============================================
// GET CLIENT PROJECTS
// ============================================

router.get(
  "/client/:user_id",
  getClientProjects
);

// ============================================
// SEARCH & FILTER PROJECTS
// ============================================

router.get(
  "/search",
  searchProjects
);

// ============================================
// UPDATE PROJECT PROGRESS
// ============================================

router.put(
  "/:id/progress",
  updateProjectProgress
);

// ============================================
// COMPLETE PROJECT
// ============================================

router.put(
  "/:id/complete",
  completeProject
);

// ============================================
// GET SINGLE PROJECT
// ============================================

router.get(
  "/:id",
  getProjectById
);

// ============================================
// UPDATE PROJECT
// ============================================

router.put(
  "/:id",
  updateProject
);

// ============================================
// DELETE PROJECT
// ============================================

router.delete(
  "/:id",
  deleteProject
);

module.exports = router;