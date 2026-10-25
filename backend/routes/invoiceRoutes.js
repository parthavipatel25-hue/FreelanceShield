
const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authMiddleware");

const {
  getMyInvoices,
  getInvoiceById,
} = require("../controllers/invoiceController");

// Get invoices for the logged-in user
router.get("/my-invoices", authenticateToken, getMyInvoices);

// Get one invoice
router.get("/:id", authenticateToken, getInvoiceById);

module.exports = router;
