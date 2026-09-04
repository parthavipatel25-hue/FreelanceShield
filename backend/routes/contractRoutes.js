const express = require("express");

const router = express.Router();

const {
  getContractById,
  getFreelancerContracts,
  getClientContracts,
  updateContractStatus,
} = require("../controllers/contractController");

// ============================================
// GET FREELANCER CONTRACTS
// ============================================

router.get(
  "/freelancer/:user_id",
  getFreelancerContracts
);

// ============================================
// GET CLIENT CONTRACTS
// ============================================

router.get(
  "/client/:user_id",
  getClientContracts
);

// ============================================
// GET CONTRACT BY ID
// ============================================

router.get(
  "/:id",
  getContractById
);

// ============================================
// UPDATE CONTRACT STATUS
// ============================================

router.put(
  "/:id/status",
  updateContractStatus
);

module.exports = router;