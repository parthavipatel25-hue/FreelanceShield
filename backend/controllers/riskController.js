const pool = require("../config/db");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const {
  sendPasswordResetEmail,
  sendSecurityNotificationEmail,
} = require("../utils/mailer");

// ======================================================
// CONFIG
// ======================================================

const FRONTEND_URL =
  process.env.FRONTEND_URL || "http://localhost:3000";

const PASSWORD_RESET_EXPIRY_MINUTES = 15;

// ======================================================
// HELPER: HASH RESET TOKEN
// ======================================================

const hashToken = (token) => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};

// ======================================================
// HELPER: CHECK ADMIN
// ======================================================

const checkAdmin = async (adminId) => {
  if (!adminId) {
    return {
      valid: false,
      status: 400,
      message: "Admin ID is required.",
    };
  }

  const result = await pool.query(
    `
    SELECT
      id,
      fullname,
      email,
      role
    FROM users
    WHERE id = $1
    `,
    [adminId]
  );

  if (result.rows.length === 0) {
    return {
      valid: false,
      status: 404,
      message: "Admin not found.",
    };
  }

  if (result.rows[0].role !== "admin") {
    return {
      valid: false,
      status: 403,
      message: "Only administrators can manage risks.",
    };
  }

  return {
    valid: true,
    admin: result.rows[0],
  };
};

// ======================================================
// GET ALL RISKS
// ======================================================

const getAllRisks = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        r.*,

        u.fullname AS user_name,
        u.email AS user_email,

        reviewer.fullname AS reviewer_name,
        resolver.fullname AS resolver_name

      FROM risks r

      LEFT JOIN users u
        ON r.user_id = u.id

      LEFT JOIN users reviewer
        ON r.reviewed_by = reviewer.id

      LEFT JOIN users resolver
        ON r.resolved_by = resolver.id

      ORDER BY
        CASE r.severity
          WHEN 'critical' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          WHEN 'low' THEN 4
          ELSE 5
        END,
        r.created_at DESC
    `);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      risks: result.rows,
    });
  } catch (error) {
    console.error("GET ALL RISKS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ======================================================
// GET SINGLE RISK
// ======================================================

const getRiskById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        r.*,

        u.fullname AS user_name,
        u.email AS user_email,

        reviewer.fullname AS reviewer_name,
        resolver.fullname AS resolver_name

      FROM risks r

      LEFT JOIN users u
        ON r.user_id = u.id

      LEFT JOIN users reviewer
        ON r.reviewed_by = reviewer.id

      LEFT JOIN users resolver
        ON r.resolved_by = resolver.id

      WHERE r.id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Risk not found.",
      });
    }

    return res.status(200).json({
      success: true,
      risk: result.rows[0],
    });
  } catch (error) {
    console.error("GET RISK ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ======================================================
// CREATE RISK
// ======================================================

const createRisk = async (req, res) => {
  try {
    const {
      user_id,
      security_report_id,
      risk_type,
      title,
      description,
      severity,
      recommended_action,
    } = req.body;

    if (!risk_type || !title || !description || !severity) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    const allowedSeverities = [
      "low",
      "medium",
      "high",
      "critical",
    ];

    if (!allowedSeverities.includes(severity)) {
      return res.status(400).json({
        success: false,
        message:
          "Severity must be low, medium, high, or critical.",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO risks (
        user_id,
        security_report_id,
        risk_type,
        title,
        description,
        severity,
        status,
        recommended_action
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        'open',
        $7
      )
      RETURNING *
      `,
      [
        user_id || null,
        security_report_id || null,
        risk_type.trim(),
        title.trim(),
        description.trim(),
        severity,
        recommended_action?.trim() || null,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Risk created successfully.",
      risk: result.rows[0],
    });
  } catch (error) {
    console.error("CREATE RISK ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ======================================================
// UPDATE RISK STATUS / RESOLUTION
// ======================================================

const updateRiskStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      status,
      admin_id,
      resolution_action,
      resolution_note,
    } = req.body;

    // ==================================================
    // CHECK ADMIN
    // ==================================================

    const adminCheck = await checkAdmin(admin_id);

    if (!adminCheck.valid) {
      return res.status(adminCheck.status).json({
        success: false,
        message: adminCheck.message,
      });
    }

    // ==================================================
    // VALIDATE STATUS
    // ==================================================

    const allowedStatuses = [
      "open",
      "reviewed",
      "resolved",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Status must be open, reviewed, or resolved.",
      });
    }

    // ==================================================
    // GET RISK
    // ==================================================

    const riskResult = await pool.query(
      `
      SELECT
        r.*,
        u.fullname AS user_name,
        u.email AS user_email
      FROM risks r
      LEFT JOIN users u
        ON r.user_id = u.id
      WHERE r.id = $1
      `,
      [id]
    );

    if (riskResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Risk not found.",
      });
    }

    const risk = riskResult.rows[0];

    // ==================================================
    // REVIEW
    // ==================================================

    if (status === "reviewed") {
      const result = await pool.query(
        `
        UPDATE risks
        SET
          status = 'reviewed',
          reviewed_by = $1,
          reviewed_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
        `,
        [admin_id, id]
      );

      return res.status(200).json({
        success: true,
        message: "Risk marked as reviewed.",
        risk: result.rows[0],
      });
    }

    // ==================================================
    // REOPEN
    // ==================================================

    if (status === "open") {
      const result = await pool.query(
        `
        UPDATE risks
        SET
          status = 'open',
          reviewed_by = NULL,
          reviewed_at = NULL,
          resolved_by = NULL,
          resolved_at = NULL,
          resolution_action = NULL,
          resolution_note = NULL,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
        `,
        [id]
      );

      return res.status(200).json({
        success: true,
        message: "Risk reopened successfully.",
        risk: result.rows[0],
      });
    }

    // ==================================================
    // RESOLVE
    // ==================================================

    if (status === "resolved") {
      // ------------------------------------------------
      // RESOLUTION ACTION REQUIRED
      // ------------------------------------------------

      if (!resolution_action) {
        return res.status(400).json({
          success: false,
          message:
            "You must select a resolution action before resolving the risk.",
        });
      }

      // ------------------------------------------------
      // RESOLUTION NOTE REQUIRED
      // ------------------------------------------------

      if (
        !resolution_note ||
        resolution_note.trim() === ""
      ) {
        return res.status(400).json({
          success: false,
          message: "Please enter a resolution note.",
        });
      }

      // ------------------------------------------------
      // ALLOWED ACTIONS
      // ------------------------------------------------

      const allowedActions = [
        "reset_password",
        "disable_account",
        "unlock_account",
        "notify_user",
        "manual_fix",
      ];

      if (!allowedActions.includes(resolution_action)) {
        return res.status(400).json({
          success: false,
          message: "Invalid resolution action.",
        });
      }

      // ------------------------------------------------
      // START TRANSACTION
      // ------------------------------------------------

      const client = await pool.connect();

      let passwordResetEmailData = null;

      try {
        await client.query("BEGIN");

        let notificationMessage = null;
        let notificationTitle =
          "Security Issue Resolved";

        // ==================================================
        // RESET PASSWORD
        // ==================================================

        if (resolution_action === "reset_password") {
          if (!risk.user_id) {
            throw new Error(
              "This risk is not associated with a registered user."
            );
          }

          // ----------------------------------------------
          // GET USER
          // ----------------------------------------------

          const userResult = await client.query(
            `
            SELECT
              id,
              fullname,
              email
            FROM users
            WHERE id = $1
            FOR UPDATE
            `,
            [risk.user_id]
          );

          if (userResult.rows.length === 0) {
            throw new Error(
              "Associated user not found."
            );
          }

          const targetUser = userResult.rows[0];

          // ----------------------------------------------
          // GENERATE TEMPORARY PASSWORD
          // ----------------------------------------------

          const temporaryPassword = crypto
            .randomBytes(12)
            .toString("base64")
            .replace(/[^a-zA-Z0-9]/g, "")
            .slice(0, 12);

          // ----------------------------------------------
          // HASH TEMPORARY PASSWORD
          // ----------------------------------------------

          const hashedPassword =
            await bcrypt.hash(
              temporaryPassword,
              10
            );

          // ----------------------------------------------
          // GENERATE RESET TOKEN
          // ----------------------------------------------

          const resetToken =
            crypto.randomBytes(32).toString("hex");

          const resetTokenHash =
            hashToken(resetToken);

          // ----------------------------------------------
          // UPDATE USER
          // ----------------------------------------------

          await client.query(
            `
            UPDATE users
            SET
              password = $1,
              force_password_reset = TRUE,
              account_status = 'active'
            WHERE id = $2
            `,
            [
              hashedPassword,
              targetUser.id,
            ]
          );

          // ----------------------------------------------
          // REMOVE OLD RESET TOKENS
          // ----------------------------------------------

          await client.query(
            `
            DELETE FROM password_reset_tokens
            WHERE user_id = $1
              AND used_at IS NULL
            `,
            [targetUser.id]
          );

          // ----------------------------------------------
          // STORE NEW RESET TOKEN
          // ----------------------------------------------

          await client.query(
            `
            INSERT INTO password_reset_tokens (
              user_id,
              token_hash,
              expires_at
            )
            VALUES (
              $1,
              $2,
              CURRENT_TIMESTAMP + INTERVAL '${PASSWORD_RESET_EXPIRY_MINUTES} minutes'
            )
            `,
            [
              targetUser.id,
              resetTokenHash,
            ]
          );

          // ----------------------------------------------
          // CREATE RESET LINK
          // ----------------------------------------------

          const resetLink =
            `${FRONTEND_URL}/reset-password?token=${encodeURIComponent(
              resetToken
            )}`;

          // ----------------------------------------------
          // STORE EMAIL DATA IN MEMORY
          // ----------------------------------------------

          passwordResetEmailData = {
            email: targetUser.email,
            fullname: targetUser.fullname,
            temporaryPassword,
            resetLink,
          };

          // ----------------------------------------------
          // DATABASE NOTIFICATION
          // ----------------------------------------------

          notificationMessage =
            "Your password was reset by an administrator after a security review. A temporary password and secure password-reset link have been sent to your registered email address.";

          notificationTitle =
            "Password Reset by Administrator";
        }

        // ==================================================
        // DISABLE ACCOUNT
        // ==================================================

        if (
          resolution_action ===
          "disable_account"
        ) {
          if (!risk.user_id) {
            throw new Error(
              "This risk is not associated with a registered user."
            );
          }

          await client.query(
            `
            UPDATE users
            SET
              account_status = 'disabled'
            WHERE id = $1
            `,
            [risk.user_id]
          );

          notificationMessage =
            "Your account has been temporarily disabled by an administrator following a security review. Please contact FreelanceShield support if you believe this was a mistake.";

          notificationTitle =
            "Account Temporarily Disabled";
        }

        // ==================================================
        // UNLOCK ACCOUNT
        // ==================================================

        if (
          resolution_action ===
          "unlock_account"
        ) {
          if (!risk.user_id) {
            throw new Error(
              "This risk is not associated with a registered user."
            );
          }

          await client.query(
            `
            UPDATE users
            SET
              account_status = 'active'
            WHERE id = $1
            `,
            [risk.user_id]
          );

          notificationMessage =
            "Your account has been reviewed and unlocked by an administrator. You can now log in normally.";

          notificationTitle =
            "Account Unlocked";
        }

        // ==================================================
        // NOTIFY USER ONLY
        // ==================================================

        if (
          resolution_action ===
          "notify_user"
        ) {
          if (!risk.user_id) {
            throw new Error(
              "This risk is not associated with a registered user."
            );
          }

          notificationMessage =
            "Your recent security issue was reviewed by an administrator. No further action is currently required from you.";

          notificationTitle =
            "Security Issue Reviewed";
        }

        // ==================================================
        // MANUAL FIX
        // ==================================================

        if (
          resolution_action ===
          "manual_fix"
        ) {
          if (risk.user_id) {
            notificationMessage =
              "Your recent security issue was reviewed and resolved by an administrator. No further action is currently required from you.";

            notificationTitle =
              "Security Issue Resolved";
          }
        }

        // ==================================================
        // DATABASE NOTIFICATION
        // ==================================================

        if (
          risk.user_id &&
          notificationMessage
        ) {
          await client.query(
            `
            INSERT INTO notifications (
              user_id,
              type,
              title,
              message,
              reference_id
            )
            VALUES (
              $1,
              $2,
              $3,
              $4,
              $5
            )
            `,
            [
              risk.user_id,
              "security_resolution",
              notificationTitle,
              notificationMessage,
              risk.id,
            ]
          );
        }

        // ==================================================
        // UPDATE RISK
        // ==================================================

        const updatedRisk = await client.query(
          `
          UPDATE risks
          SET
            status = 'resolved',
            resolved_by = $1,
            resolved_at = CURRENT_TIMESTAMP,
            resolution_action = $2,
            resolution_note = $3,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $4
          RETURNING *
          `,
          [
            admin_id,
            resolution_action,
            resolution_note.trim(),
            id,
          ]
        );

        // ==================================================
        // UPDATE LINKED SECURITY REPORT
        // ==================================================

        if (risk.security_report_id) {
          await client.query(
            `
            UPDATE security_reports
            SET
              status = 'resolved'
            WHERE id = $1
            `,
            [risk.security_report_id]
          );
        }

        // ==================================================
        // ACTIVITY LOG
        // ==================================================

        await client.query(
          `
          INSERT INTO activity_logs (
            user_id,
            action,
            description,
            entity_type,
            entity_id
          )
          VALUES (
            $1,
            $2,
            $3,
            $4,
            $5
          )
          `,
          [
            admin_id,
            "risk_resolved",
            `Risk #${risk.id} resolved using action: ${resolution_action}. Note: ${resolution_note.trim()}`,
            "risk",
            risk.id,
          ]
        );

        // ==================================================
        // COMMIT DATABASE CHANGES
        // ==================================================

        await client.query("COMMIT");

        // ==================================================
        // SEND TEMPORARY PASSWORD EMAIL
        // ==================================================

        if (passwordResetEmailData) {
          try {
            await sendPasswordResetEmail({
              email:
                passwordResetEmailData.email,
              fullname:
                passwordResetEmailData.fullname,
              temporaryPassword:
                passwordResetEmailData.temporaryPassword,
              resetLink:
                passwordResetEmailData.resetLink,
            });

            console.log(
              `Password reset email sent to ${passwordResetEmailData.email}`
            );
          } catch (emailError) {
            console.error(
              "PASSWORD RESET EMAIL ERROR:",
              emailError
            );

            return res.status(200).json({
              success: true,
              message:
                "Risk resolved and the password was reset, but the email containing the temporary password could not be sent.",
              emailSent: false,
              risk: updatedRisk.rows[0],
            });
          }
        }

        // ==================================================
        // SEND GENERAL SECURITY EMAIL
        // ==================================================

        if (
          resolution_action !==
            "reset_password" &&
          risk.user_email &&
          notificationMessage
        ) {
          try {
            await sendSecurityNotificationEmail({
              email: risk.user_email,
              fullname: risk.user_name,
              subject: notificationTitle,
              message: notificationMessage,
            });

            console.log(
              `Security notification email sent to ${risk.user_email}`
            );
          } catch (emailError) {
            console.error(
              "SECURITY NOTIFICATION EMAIL ERROR:",
              emailError
            );
          }
        }

        // ==================================================
        // SUCCESS RESPONSE
        // ==================================================

        return res.status(200).json({
          success: true,

          message:
            resolution_action ===
            "reset_password"
              ? "Risk resolved. A temporary password and password reset link have been sent to the user's registered email address."
              : "Risk resolved and the selected corrective action was completed.",

          emailSent:
            resolution_action ===
            "reset_password"
              ? true
              : undefined,

          risk: updatedRisk.rows[0],
        });
      } catch (transactionError) {
        await client.query("ROLLBACK");

        console.error(
          "RISK RESOLUTION TRANSACTION ERROR:",
          transactionError
        );

        return res.status(500).json({
          success: false,
          message:
            transactionError.message ||
            "Failed to resolve risk.",
        });
      } finally {
        client.release();
      }
    }
  } catch (error) {
    console.error(
      "UPDATE RISK STATUS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ======================================================
// DELETE RISK
// ======================================================

const deleteRisk = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM risks
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Risk not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Risk deleted successfully.",
      risk: result.rows[0],
    });
  } catch (error) {
    console.error(
      "DELETE RISK ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ======================================================
// RISK SUMMARY
// ======================================================

const getRiskSummary = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*) AS total_risks,

        COUNT(*) FILTER (
          WHERE status = 'open'
        ) AS open_risks,

        COUNT(*) FILTER (
          WHERE status = 'reviewed'
        ) AS reviewed_risks,

        COUNT(*) FILTER (
          WHERE status = 'resolved'
        ) AS resolved_risks,

        COUNT(*) FILTER (
          WHERE severity = 'critical'
        ) AS critical_risks,

        COUNT(*) FILTER (
          WHERE severity = 'high'
        ) AS high_risks,

        COUNT(*) FILTER (
          WHERE severity = 'medium'
        ) AS medium_risks,

        COUNT(*) FILTER (
          WHERE severity = 'low'
        ) AS low_risks

      FROM risks
    `);

    return res.status(200).json({
      success: true,
      summary: result.rows[0],
    });
  } catch (error) {
    console.error(
      "GET RISK SUMMARY ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  getAllRisks,
  getRiskById,
  createRisk,
  updateRiskStatus,
  deleteRisk,
  getRiskSummary,
  hashToken,
};
