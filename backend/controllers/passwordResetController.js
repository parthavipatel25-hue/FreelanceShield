
const pool = require("../config/db");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const FRONTEND_URL = (
  process.env.FRONTEND_URL || "http://localhost:3000"
).replace(/\/+$/, "");

const RESET_TOKEN_TTL_MINUTES = 15;

// ======================================================
// HELPERS
// ======================================================

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const generateToken = () =>
  crypto.randomBytes(32).toString("hex");

const createResetLink = (token) => {
  const url = new URL(`${FRONTEND_URL}/reset-password`);
  url.searchParams.set("token", token);
  return url.toString();
};

const genericRequestMessage =
  "If an eligible account exists, your password-reset request has been submitted. Save your tracking code to check its status.";

// ======================================================
// CREATE NOTIFICATIONS FOR ALL ADMINS
// ======================================================

const createAdminPasswordResetNotifications = async (
  queryable,
  requestId,
  email
) => {
  const adminResult = await queryable.query(
    `
      SELECT id
      FROM users
      WHERE role = 'admin'
    `
  );

  for (const admin of adminResult.rows) {
    await queryable.query(
      `
        INSERT INTO notifications (
          user_id,
          type,
          title,
          message,
          reference_id
        )
        VALUES ($1, $2, $3, $4, $5)
      `,
      [
        admin.id,
        "password_reset_request",
        "New Password Reset Request",
        `A password-reset request has been submitted for ${email}. Please review it.`,
        requestId,
      ]
    );
  }
};

// ======================================================
// SUBMIT PASSWORD RESET REQUEST
// POST /api/password-reset/request
// ======================================================

const requestPasswordReset = async (req, res) => {
  const email = String(req.body.email || "")
    .trim()
    .toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid email address.",
    });
  }

  const trackingCode = generateToken();
  const trackingHash = hashToken(trackingCode);

  let client;

  try {
    const userResult = await pool.query(
      `
        SELECT id
        FROM users
        WHERE LOWER(email) = LOWER($1)
          AND (account_status IS NULL OR account_status = 'active')
        LIMIT 1
      `,
      [email]
    );

    // Keep the public response generic for unknown accounts.
    if (userResult.rows.length === 0) {
      return res.status(200).json({
        success: true,
        message: genericRequestMessage,
        trackingCode,
      });
    }

    const userId = userResult.rows[0].id;

    client = await pool.connect();
    await client.query("BEGIN");

    const insertResult = await client.query(
      `
        INSERT INTO password_reset_requests (
          user_id,
          email,
          status,
          tracking_token_hash
        )
        VALUES ($1, $2, 'pending', $3)
        RETURNING id
      `,
      [userId, email, trackingHash]
    );

    const requestId = insertResult.rows[0].id;

    // Notify every admin about this newly created request.
    await createAdminPasswordResetNotifications(
      client,
      requestId,
      email
    );

    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      message: genericRequestMessage,
      trackingCode,
    });
  } catch (error) {
    if (client) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("REQUEST ROLLBACK ERROR:", rollbackError);
      }
    }

    // A pending request already exists.
    // Do not return a tracking code that was never saved.
    if (error.code === "23505") {
      return res.status(200).json({
        success: true,
        message:
          "If an eligible account exists, your password-reset request has been submitted. If you already have a pending request, please use its existing tracking code.",
      });
    }

    console.error("REQUEST PASSWORD RESET ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to process your request right now.",
    });
  } finally {
    if (client) {
      client.release();
    }
  }
};

// ======================================================
// CHECK REQUEST STATUS
// POST /api/password-reset/status
// ======================================================

const checkPasswordResetStatus = async (req, res) => {
  const trackingCode = String(
    req.body.trackingCode || ""
  ).trim();

  if (!/^[a-f0-9]{64}$/i.test(trackingCode)) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid tracking code.",
    });
  }

  const trackingHash = hashToken(trackingCode);

  let client;

  try {
    client = await pool.connect();
    await client.query("BEGIN");

    const result = await client.query(
      `
        SELECT
          id,
          email,
          status,
          rejection_reason,
          created_at,
          reviewed_at
        FROM password_reset_requests
        WHERE tracking_token_hash = $1
        FOR UPDATE
      `,
      [trackingHash]
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        success: false,
        message: "Invalid tracking code. Please check and try again.",
      });
    }

    const request = result.rows[0];

    const response = {
      success: true,
      status: request.status,
      email: request.email,
      message: "",
    };

    if (request.status === "pending") {
      response.message =
        "Your request is waiting for admin approval.";
    }

    if (request.status === "rejected") {
      response.message =
        "Your password-reset request was rejected.";
      response.rejectionReason =
        request.rejection_reason || "No reason provided.";
    }

    if (request.status === "completed") {
      response.message =
        "Your password has been successfully changed.";
    }

    if (request.status === "approved") {
      const resetToken = generateToken();
      const resetHash = hashToken(resetToken);

      await client.query(
        `
          UPDATE password_reset_requests
          SET
            reset_token_hash = $1,
            reset_token_expires_at =
              CURRENT_TIMESTAMP + INTERVAL '${RESET_TOKEN_TTL_MINUTES} minutes'
          WHERE id = $2
        `,
        [resetHash, request.id]
      );

      response.message =
        "Your request has been approved. You can now reset your password.";

      response.resetLink = createResetLink(resetToken);
      response.expiresInMinutes = RESET_TOKEN_TTL_MINUTES;
    }

    await client.query("COMMIT");

    return res.status(200).json(response);
  } catch (error) {
    if (client) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("STATUS ROLLBACK ERROR:", rollbackError);
      }
    }

    console.error("CHECK PASSWORD RESET STATUS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to check request status.",
    });
  } finally {
    if (client) client.release();
  }
};

// ======================================================
// ADMIN: GET PASSWORD RESET REQUESTS
// GET /api/password-reset/admin/requests
// ======================================================

const getPasswordResetRequests = async (req, res) => {
  const status = String(req.query.status || "").trim();

  const allowedStatuses = [
    "pending",
    "approved",
    "rejected",
    "completed",
  ];

  if (status && !allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid request status.",
    });
  }

  try {
    const result = await pool.query(
      `
        SELECT
          pr.id,
          pr.user_id,
          pr.email,
          u.fullname,
          u.role,
          pr.status,
          pr.rejection_reason,
          pr.created_at,
          pr.reviewed_at,
          pr.completed_at,
          reviewer.fullname AS reviewed_by_name
        FROM password_reset_requests pr
        INNER JOIN users u
          ON u.id = pr.user_id
        LEFT JOIN users reviewer
          ON reviewer.id = pr.reviewed_by
        WHERE ($1 = '' OR pr.status = $1)
        ORDER BY
          CASE WHEN pr.status = 'pending' THEN 0 ELSE 1 END,
          pr.created_at DESC
        LIMIT 200
      `,
      [status]
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      requests: result.rows,
    });
  } catch (error) {
    console.error("GET PASSWORD RESET REQUESTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load password-reset requests.",
    });
  }
};

// ======================================================
// ADMIN: APPROVE REQUEST
// POST /api/password-reset/admin/requests/:id/approve
// ======================================================

const approvePasswordResetRequest = async (req, res) => {
  const requestId = String(req.params.id || "");

  if (!/^\d+$/.test(requestId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid request ID.",
    });
  }

  const adminId = req.user.id;

  try {
    const result = await pool.query(
      `
        UPDATE password_reset_requests
        SET
          status = 'approved',
          reviewed_by = $1,
          reviewed_at = CURRENT_TIMESTAMP,
          rejection_reason = NULL,
          reset_token_hash = NULL,
          reset_token_expires_at = NULL
        WHERE id = $2
          AND status = 'pending'
        RETURNING id, email, status, reviewed_at
      `,
      [adminId, requestId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Request not found or it has already been reviewed.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Password-reset request approved successfully. The user can now check their status and generate a reset link.",
      request: result.rows[0],
    });
  } catch (error) {
    console.error("APPROVE PASSWORD RESET ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to approve this request.",
    });
  }
};

// ======================================================
// ADMIN: REJECT REQUEST
// POST /api/password-reset/admin/requests/:id/reject
// ======================================================

const rejectPasswordResetRequest = async (req, res) => {
  const requestId = String(req.params.id || "");
  const reason = String(req.body.reason || "").trim();

  if (!/^\d+$/.test(requestId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid request ID.",
    });
  }

  if (!reason) {
    return res.status(400).json({
      success: false,
      message: "Please provide a rejection reason.",
    });
  }

  if (reason.length > 500) {
    return res.status(400).json({
      success: false,
      message: "Rejection reason cannot exceed 500 characters.",
    });
  }

  try {
    const result = await pool.query(
      `
        UPDATE password_reset_requests
        SET
          status = 'rejected',
          rejection_reason = $1,
          reviewed_by = $2,
          reviewed_at = CURRENT_TIMESTAMP,
          reset_token_hash = NULL,
          reset_token_expires_at = NULL
        WHERE id = $3
          AND status = 'pending'
        RETURNING id, email, status, rejection_reason, reviewed_at
      `,
      [reason, req.user.id, requestId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Request not found or it has already been reviewed.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Password-reset request rejected successfully.",
      request: result.rows[0],
    });
  } catch (error) {
    console.error("REJECT PASSWORD RESET ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to reject this request.",
    });
  }
};

// ======================================================
// RESET PASSWORD
// POST /api/password-reset/reset-password
// ======================================================

const resetPassword = async (req, res) => {
  const token = String(req.body.token || "").trim();
  const newPassword = String(req.body.newPassword || "");

  if (!token || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Reset token and new password are required.",
    });
  }

  if (!/^[a-f0-9]{64}$/i.test(token)) {
    return res.status(400).json({
      success: false,
      message: "Invalid or expired password-reset link.",
    });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password must contain at least 8 characters.",
    });
  }

  if (Buffer.byteLength(newPassword, "utf8") > 72) {
    return res.status(400).json({
      success: false,
      message: "Password is too long. Please use a shorter password.",
    });
  }

  const tokenHash = hashToken(token);
  let client;

  try {
    client = await pool.connect();
    await client.query("BEGIN");

    const result = await client.query(
      `
        SELECT id, user_id
        FROM password_reset_requests
        WHERE reset_token_hash = $1
          AND status = 'approved'
          AND reset_token_expires_at > CURRENT_TIMESTAMP
        FOR UPDATE
      `,
      [tokenHash]
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        success: false,
        message:
          "This password-reset link is invalid, expired, or already used.",
      });
    }

    const resetRequest = result.rows[0];

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await client.query(
      `
        UPDATE users
        SET
          password = $1,
          force_password_reset = FALSE,
          failed_login_attempts = 0,
          last_failed_login_at = NULL
        WHERE id = $2
      `,
      [hashedPassword, resetRequest.user_id]
    );

    await client.query(
      `
        UPDATE password_reset_requests
        SET
          status = 'completed',
          completed_at = CURRENT_TIMESTAMP,
          reset_token_hash = NULL,
          reset_token_expires_at = NULL
        WHERE id = $1
      `,
      [resetRequest.id]
    );

    await client.query(
      `
        UPDATE password_reset_requests
        SET
          reset_token_hash = NULL,
          reset_token_expires_at = NULL
        WHERE user_id = $1
          AND id <> $2
          AND status = 'approved'
      `,
      [resetRequest.user_id, resetRequest.id]
    );

    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      message:
        "Your password has been changed successfully. You can now log in using your new password.",
    });
  } catch (error) {
    if (client) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("RESET ROLLBACK ERROR:", rollbackError);
      }
    }

    console.error("RESET PASSWORD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to reset your password right now.",
    });
  } finally {
    if (client) client.release();
  }
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  requestPasswordReset,
  checkPasswordResetStatus,
  getPasswordResetRequests,
  approvePasswordResetRequest,
  rejectPasswordResetRequest,
  resetPassword,
};
