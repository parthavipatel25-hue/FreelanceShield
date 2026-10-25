
const crypto = require("crypto");
const Razorpay = require("razorpay");
const pool = require("../config/db");

const razorpay =
  process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
    ? new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      })
    : null;

// Create a Razorpay order for an active contract.
const createPayment = async (req, res) => {
  const userId = req.user?.id;
  const contractId = Number(req.body.contractId);

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Please log in to continue.",
    });
  }

  if (req.user?.role !== "client") {
    return res.status(403).json({
      success: false,
      message: "Only clients can initiate payments.",
    });
  }

  if (!Number.isInteger(contractId) || contractId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Please select a valid project.",
    });
  }

  if (!razorpay) {
    return res.status(503).json({
      success: false,
      message: "Razorpay Test Mode credentials are not configured.",
    });
  }

  const db = await pool.connect();

  try {
    // Find the active contract belonging to this client.
    // The project name is displayed to the user.
    // IDs are kept internally for secure database linking.
    const contractResult = await db.query(
      `SELECT
         c.id AS contract_id,
         c.project_id,
         c.client_id,
         c.freelancer_id,
         c.amount,
         c.status,
         pr.title AS project_title,
         cp.user_id AS client_user_id
       FROM contracts c
       JOIN client_profiles cp
         ON cp.id = c.client_id
       JOIN projects pr
         ON pr.id = c.project_id
       WHERE c.id = $1
         AND cp.user_id = $2
       LIMIT 1`,
      [contractId, userId]
    );

    if (contractResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Project contract not found or you do not have access.",
      });
    }

    const contract = contractResult.rows[0];

    if (contract.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Payments can only be initiated for active contracts.",
      });
    }

    const amount = Number(contract.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "The contract has an invalid payment amount.",
      });
    }

    // Prevent paying the same full contract more than once.
    const existingPayment = await db.query(
      `SELECT id
       FROM payments
       WHERE contract_id = $1
         AND status = 'successful'
       LIMIT 1`,
      [contractId]
    );

    if (existingPayment.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "This contract has already been paid.",
      });
    }

    // Razorpay requires the amount in paise.
    const amountInPaise = Math.round(amount * 100);

    if (amountInPaise <= 0) {
      return res.status(400).json({
        success: false,
        message: "The contract amount is too small.",
      });
    }

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `contract_${contract.contract_id}_${Date.now()}`,
      notes: {
        contractId: String(contract.contract_id),
        projectId: String(contract.project_id),
        projectName: contract.project_title,
      },
    });

    const insertResult = await db.query(
      `INSERT INTO payments (
         user_id,
         project_id,
         contract_id,
         freelancer_id,
         amount,
         currency,
         payment_method,
         razorpay_order_id,
         status
       )
       VALUES ($1, $2, $3, $4, $5, 'INR', 'razorpay', $6, 'pending')
       RETURNING
         id,
         project_id,
         contract_id,
         amount,
         currency,
         razorpay_order_id,
         status`,
      [
        userId,
        contract.project_id,
        contract.contract_id,
        contract.freelancer_id,
        amount,
        order.id,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Razorpay order created.",
      payment: {
        ...insertResult.rows[0],
        project_title: contract.project_title,
      },
      razorpayOrder: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Create payment error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create the payment order.",
    });
  } finally {
    db.release();
  }
};

// Verify the payment signature received after Razorpay Checkout.
const verifyPayment = async (req, res) => {
  const userId = req.user?.id;

  const {
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: signature,
  } = req.body;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Please log in to continue.",
    });
  }

  if (req.user?.role !== "client") {
    return res.status(403).json({
      success: false,
      message: "Only clients can verify their payments.",
    });
  }

  if (
    !orderId ||
    !paymentId ||
    !signature ||
    typeof orderId !== "string" ||
    typeof paymentId !== "string" ||
    typeof signature !== "string"
  ) {
    return res.status(400).json({
      success: false,
      message: "Required Razorpay verification details are missing.",
    });
  }

  if (!razorpay || !process.env.RAZORPAY_KEY_SECRET) {
    return res.status(503).json({
      success: false,
      message: "Razorpay verification is not configured.",
    });
  }

  const db = await pool.connect();

  try {
    const result = await db.query(
      `SELECT
         p.id,
         p.user_id,
         p.project_id,
         p.contract_id,
         p.amount,
         p.currency,
         p.status,
         pr.title AS project_title
       FROM payments p
       LEFT JOIN projects pr
         ON pr.id = p.project_id
       WHERE p.razorpay_order_id = $1
       LIMIT 1`,
      [orderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Payment order not found.",
      });
    }

    const payment = result.rows[0];

    // Only the client who created this payment can verify it.
    if (Number(payment.user_id) !== Number(userId)) {
      return res.status(403).json({
        success: false,
        message: "You cannot verify this payment.",
      });
    }

    if (payment.status === "successful") {
      return res.json({
        success: true,
        message: "Payment has already been verified.",
        payment: {
          ...payment,
          project_title: payment.project_title,
        },
      });
    }

    if (payment.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "This payment is no longer pending.",
      });
    }

    // Verify the signature using the server-side secret.
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    // Reject malformed signature strings before timing-safe comparison.
    if (!/^[a-f0-9]{64}$/i.test(signature)) {
      return res.status(400).json({
        success: false,
        message: "Payment signature verification failed.",
      });
    }

    const received = Buffer.from(signature, "hex");
    const expected = Buffer.from(expectedSignature, "hex");

    if (
      received.length !== expected.length ||
      !crypto.timingSafeEqual(received, expected)
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment signature verification failed.",
      });
    }

    // Verify the payment with Razorpay's API.
    const gatewayPayment = await razorpay.payments.fetch(paymentId);

    if (
      gatewayPayment.order_id !== orderId ||
      gatewayPayment.currency !== payment.currency ||
      Number(gatewayPayment.amount) !==
        Math.round(Number(payment.amount) * 100) ||
      gatewayPayment.status !== "captured"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "The gateway payment is not captured or does not match the order.",
      });
    }

    const updateResult = await db.query(
      `UPDATE payments
       SET transaction_id = $1,
           status = 'successful',
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
         AND user_id = $3
         AND status = 'pending'
       RETURNING
         id,
         project_id,
         contract_id,
         amount,
         currency,
         transaction_id,
         status`,
      [paymentId, payment.id, userId]
    );

    if (updateResult.rows.length === 0) {
      return res.status(409).json({
        success: false,
        message:
          "Payment status changed. Refresh your payment history.",
      });
    }

    return res.json({
      success: true,
      message: "Payment verified successfully.",
      payment: {
        ...updateResult.rows[0],
        project_title: payment.project_title,
      },
    });
  } catch (error) {
    console.error("Verify payment error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to verify the payment.",
    });
  } finally {
    db.release();
  }
};

// Return payment history for the logged-in client or freelancer.
const getMyPayments = async (req, res) => {
  const userId = req.user?.id;
  const role = req.user?.role;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Please log in to continue.",
    });
  }

  if (!["client", "freelancer"].includes(role)) {
    return res.status(403).json({
      success: false,
      message: "Payment history is not available for this role.",
    });
  }

  try {
    // The column name is selected from a fixed allowlist.
    const column = role === "freelancer" ? "freelancer_id" : "user_id";

    const result = await pool.query(
      `SELECT
         p.id,
         p.project_id,
         p.contract_id,
         p.amount,
         p.currency,
         p.payment_method,
         p.transaction_id,
         p.razorpay_order_id,
         p.status,
         p.created_at,
         pr.title AS project_title,
         CASE
           WHEN $2 = 'freelancer' THEN client_user.fullname
           ELSE freelancer.fullname
         END AS other_party_name
       FROM payments p
       LEFT JOIN projects pr
         ON pr.id = p.project_id
       LEFT JOIN contracts c
         ON c.id = p.contract_id
       LEFT JOIN client_profiles cp
         ON cp.id = c.client_id
       LEFT JOIN users client_user
         ON client_user.id = cp.user_id
       LEFT JOIN users freelancer
         ON freelancer.id = c.freelancer_id
       WHERE p.${column} = $1
       ORDER BY p.created_at DESC`,
      [userId, role]
    );

    const payments = result.rows;

    const successful = payments.filter(
      (payment) => payment.status === "successful"
    );

    const pending = payments.filter(
      (payment) => payment.status === "pending"
    );

    return res.json({
      success: true,
      payments,
      summary: {
        totalEarned:
          role === "freelancer"
            ? successful.reduce(
                (total, payment) => total + Number(payment.amount),
                0
              )
            : 0,
        totalPaid:
          role === "client"
            ? successful.reduce(
                (total, payment) => total + Number(payment.amount),
                0
              )
            : 0,
        pendingAmount: pending.reduce(
          (total, payment) => total + Number(payment.amount),
          0
        ),
        totalTransactions: payments.length,
      },
    });
  } catch (error) {
    console.error("Get payments error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load payment history.",
    });
  }
};


const getMyContracts = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Please log in to continue.",
    });
  }

  if (req.user?.role !== "client") {
    return res.status(403).json({
      success: false,
      message: "Only clients can view projects available for payment.",
    });
  }

  try {
    const result = await pool.query(
      `SELECT
         c.id AS contract_id,
         c.project_id,
         pr.title AS project_title,
         c.amount,
         c.status
       FROM contracts c
       JOIN client_profiles cp
         ON cp.id = c.client_id
       JOIN projects pr
         ON pr.id = c.project_id
       WHERE cp.user_id = $1
         AND c.status = 'active'
         AND NOT EXISTS (
           SELECT 1
           FROM payments p
           WHERE p.contract_id = c.id
             AND p.status = 'successful'
         )
       ORDER BY pr.title ASC`,
      [userId]
    );

    return res.json({
      success: true,
      contracts: result.rows,
    });
  } catch (error) {
    console.error("Get client contracts error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load your projects.",
    });
  }
};

// Demo payment for college project use only.
// No real money is charged.
const createDemoPayment = async (req, res) => {
  const userId = req.user?.id;
  const contractId = Number(req.body.contractId);

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Please log in to continue.",
    });
  }

  if (req.user?.role !== "client") {
    return res.status(403).json({
      success: false,
      message: "Only clients can make demo payments.",
    });
  }

  if (
    process.env.DEMO_PAYMENTS_ENABLED !== "true"
  ) {
    return res.status(403).json({
      success: false,
      message: "Demo payments are disabled.",
    });
  }

  if (!Number.isInteger(contractId) || contractId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Please select a valid contract.",
    });
  }

  const db = await pool.connect();
  let transactionStarted = false;

  try {
    await db.query("BEGIN");
    transactionStarted = true;

    // Check that this contract belongs to the logged-in client.
    const result = await db.query(
      `SELECT
         c.id AS contract_id,
         c.project_id,
         c.freelancer_id,
         c.amount,
         c.status,
         pr.title AS project_title,
         cp.user_id AS client_user_id
       FROM contracts c
       JOIN client_profiles cp ON cp.id = c.client_id
       JOIN projects pr ON pr.id = c.project_id
       WHERE c.id = $1
         AND cp.user_id = $2
       FOR UPDATE OF c`,
      [contractId, userId]
    );

    if (result.rows.length === 0) {
      await db.query("ROLLBACK");
      transactionStarted = false;

      return res.status(404).json({
        success: false,
        message: "Contract not found.",
      });
    }

    const contract = result.rows[0];

    if (contract.status !== "active") {
      await db.query("ROLLBACK");
      transactionStarted = false;

      return res.status(400).json({
        success: false,
        message: "Only active contracts can be paid.",
      });
    }

    const amount = Number(contract.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      await db.query("ROLLBACK");
      transactionStarted = false;

      return res.status(400).json({
        success: false,
        message: "Invalid contract amount.",
      });
    }

    // Do not allow the same contract to be paid twice.
    const existing = await db.query(
      `SELECT id
       FROM payments
       WHERE contract_id = $1
         AND status = 'successful'
       LIMIT 1`,
      [contractId]
    );

    if (existing.rows.length > 0) {
      await db.query("ROLLBACK");
      transactionStarted = false;

      return res.status(409).json({
        success: false,
        message: "This contract has already been paid.",
      });
    }

    // Record a clearly labelled demo transaction.
    const paymentResult = await db.query(
      `INSERT INTO payments (
         user_id,
         project_id,
         contract_id,
         freelancer_id,
         amount,
         currency,
         payment_method,
         status
       )
       VALUES ($1, $2, $3, $4, $5, 'INR', 'demo', 'successful')
       RETURNING
         id,
         user_id,
         project_id,
         contract_id,
         freelancer_id,
         amount,
         currency,
         payment_method,
         status,
         created_at`,
      [
        userId,
        contract.project_id,
        contract.contract_id,
        contract.freelancer_id,
        amount,
      ]
    );

    await db.query("COMMIT");
    transactionStarted = false;

    return res.status(201).json({
      success: true,
      message: "Demo payment successful. No real money was charged.",
      payment: {
        ...paymentResult.rows[0],
        project_title: contract.project_title,
      },
    });
  } catch (error) {
    if (transactionStarted) {
      await db.query("ROLLBACK").catch(() => {});
    }

    console.error("Demo payment error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to record the demo payment.",
    });
  } finally {
    db.release();
  }
};

module.exports = {
  createPayment,
  verifyPayment,
  getMyPayments,
  getMyContracts,
  createDemoPayment,
};