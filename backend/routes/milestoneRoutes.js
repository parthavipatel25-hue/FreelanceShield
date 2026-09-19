const express = require("express");

const router = express.Router();

const {
  createMilestone,
  getProjectMilestones,
  getMilestoneById,
  updateMilestone,
  updateMilestoneProgress,
  deleteMilestone,
} = require("../controllers/milestoneController");

// ============================================
// CREATE MILESTONE
// ============================================

router.post("/", createMilestone);

// ============================================
// GET ALL MILESTONES FOR PROJECT
// ============================================

router.get("/project/:project_id", getProjectMilestones);

// ============================================
// UPDATE MILESTONE PROGRESS
// ============================================

router.put("/:id/progress", updateMilestoneProgress);

// ============================================
// GET SINGLE MILESTONE
// ============================================

router.get("/:id", getMilestoneById);

// ============================================
// UPDATE MILESTONE
// ============================================

router.put("/:id", updateMilestone);

// ============================================
// DELETE MILESTONE
// ============================================

router.delete("/:id", deleteMilestone);

module.exports = router;