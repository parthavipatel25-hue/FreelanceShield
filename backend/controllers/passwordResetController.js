const pool = require("../config/db");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const hashToken = (token) => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};

// ======================================================
// VERIFY RESET TOKEN
// ======================================================

const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Reset token is required.",
      });
    }

    const tokenHash = hashToken(token);

    const result = await pool.query(
      `
      SELECT
        prt.id,
        prt.user_id,
        prt.expires_at,
        u.fullname,
        u.email
      FROM password_reset_tokens prt
      INNER JOIN users u
        ON prt.user_id = u.id
      WHERE prt.token_hash = $1
        AND prt.used_at IS NULL
        AND prt.expires_at > CURRENT_TIMESTAMP
      `,
      [tokenHash]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "This password reset link is invalid or has expired.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Reset token is valid.",
      user: {
        fullname: result.rows[0].fullname,
        email: result.rows[0].email,
      },
    });
  } catch (error) {
    console.error(
      "VERIFY RESET TOKEN ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ======================================================
// RESET PASSWORD
// ======================================================

const resetPassword = async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      token,
      password,
      confirmPassword,
    } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Reset token is required.",
      });
    }

    if (!password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Password and confirm password are required.",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Passwords do not match.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least 8 characters.",
      });
    }

    const tokenHash = hashToken(token);

    await client.query("BEGIN");

    const tokenResult = await client.query(
      `
      SELECT
        id,
        user_id
      FROM password_reset_tokens
      WHERE token_hash = $1
        AND used_at IS NULL
        AND expires_at > CURRENT_TIMESTAMP
      FOR UPDATE
      `,
      [tokenHash]
    );

    if (tokenResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        success: false,
        message:
          "This password reset link is invalid or has expired.",
      });
    }

    const resetToken =
      tokenResult.rows[0];

    const hashedPassword =
      await bcrypt.hash(password, 10);

    await client.query(
      `
      UPDATE users
      SET
        password = $1,
        force_password_reset = FALSE,
        account_status = 'active'
      WHERE id = $2
      `,
      [
        hashedPassword,
        resetToken.user_id,
      ]
    );

    // Mark token as used.
    await client.query(
      `
      UPDATE password_reset_tokens
      SET used_at = CURRENT_TIMESTAMP
      WHERE id = $1
      `,
      [resetToken.id]
    );

    // Remove any other unused reset tokens.
    await client.query(
      `
      DELETE FROM password_reset_tokens
      WHERE user_id = $1
        AND id <> $2
        AND used_at IS NULL
      `,
      [
        resetToken.user_id,
        resetToken.id,
      ]
    );

    // Create dashboard notification.
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
        NULL
      )
      `,
      [
        resetToken.user_id,
        "security_password_reset",
        "Password Changed Successfully",
        "Your password was successfully changed following a security review.",
      ]
    );

    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      message:
        "Password changed successfully. You can now log in with your new password.",
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error(
      "RESET PASSWORD ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  } finally {
    client.release();
  }
};

module.exports = {
  verifyResetToken,
  resetPassword,
  hashToken,
};