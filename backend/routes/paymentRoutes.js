const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authMiddleware");

const {
  createPayment,
  verifyPayment,
  getMyPayments,
  createDemoPayment,
} = require("../controllers/paymentController");

router.post("/create", authenticateToken, createPayment);
router.post("/verify", authenticateToken, verifyPayment);
router.post("/demo", authenticateToken, createDemoPayment);

router.get("/my-payments", authenticateToken, getMyPayments);

module.exports = router;