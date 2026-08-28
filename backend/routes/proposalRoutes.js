const express = require("express");
const router = express.Router();

const {
  createProposal,
  getFreelancerProposals,
  getProjectProposals,
  acceptProposal,
  rejectProposal,
} = require("../controllers/proposalController");

// ============================================
// FREELANCER — SUBMIT PROPOSAL
// ============================================

router.post("/", createProposal);

// ============================================
// FREELANCER — VIEW OWN PROPOSALS
// ============================================

router.get("/freelancer/:user_id", getFreelancerProposals);

// ============================================
// CLIENT — VIEW PROPOSALS FOR A PROJECT
// ============================================

router.get("/project/:project_id", getProjectProposals);

// ============================================
// CLIENT — ACCEPT PROPOSAL
// ============================================

router.put("/:id/accept", acceptProposal);

// ============================================
// CLIENT — REJECT PROPOSAL
// ============================================

router.put("/:id/reject", rejectProposal);

module.exports = router;