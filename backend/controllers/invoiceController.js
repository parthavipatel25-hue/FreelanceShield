
const pool = require("../config/db");

// Get invoices for the logged-in user.
// The invoices table will be created in a later step.
const getMyInvoices = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please log in to continue.",
      });
    }

    return res.status(501).json({
      success: false,
      message: "Invoice functionality is not implemented yet.",
    });
  } catch (error) {
    console.error("Get invoices error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load invoices.",
    });
  }
};

// Get one invoice.
// Access-control checks will be added when the invoice table is implemented.
const getInvoiceById = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please log in to continue.",
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Invoice ID is required.",
      });
    }

    return res.status(501).json({
      success: false,
      message: "Invoice details are not available yet.",
    });
  } catch (error) {
    console.error("Get invoice error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load invoice details.",
    });
  }
};

module.exports = {
  getMyInvoices,
  getInvoiceById,
};
