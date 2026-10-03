const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// ======================================================
// SECURITY CONFIGURATION
// ======================================================

const FAILED_LOGIN_THRESHOLD = 3;
const FAILED_LOGIN_WINDOW_MINUTES = 15;

// ======================================================
// EMAIL CONFIGURATION
// ======================================================

const emailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ======================================================
// HELPER: SEND SECURITY ALERT EMAIL
// ======================================================

const sendSecurityAlertEmail = async ({
  email,
  fullname,
  failedAttempts,
}) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error(
        "EMAIL ERROR: EMAIL_USER or EMAIL_PASS is missing in .env"
      );

      return false;
    }

    await emailTransporter.sendMail({
      from: `"FreelanceShield Security" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "FreelanceShield Security Alert - Failed Login Attempts",

      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: auto;
          padding: 30px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
        ">

          <h2 style="color: #111827;">
            FreelanceShield Security Alert
          </h2>

          <p>
            Hello <strong>${fullname || "User"}</strong>,
          </p>

          <p>
            We detected multiple unsuccessful login attempts
            on your FreelanceShield account.
          </p>

          <div style="
            background: #fff7ed;
            border: 1px solid #fed7aa;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
          ">

            <strong>Failed login attempts:</strong>
            ${failedAttempts}

            <br />

            <strong>Security window:</strong>
            ${FAILED_LOGIN_WINDOW_MINUTES} minutes

          </div>

          <p>
            If these attempts were made by you, you can safely
            ignore this message.
          </p>

          <p>
            If you did not attempt to log in, we recommend
            changing your password immediately.
          </p>

          <p>
            <strong>FreelanceShield Security Team</strong>
          </p>

        </div>
      `,
    });

    console.log(
      `SECURITY EMAIL SENT TO: ${email}`
    );

    return true;
  } catch (error) {
    console.error(
      "SEND SECURITY EMAIL ERROR:",
      error
    );

    return false;
  }
};

// ======================================================
// HELPER: GET CLIENT IP ADDRESS
// ======================================================

const getClientIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  return req.socket?.remoteAddress || req.ip || "Unknown";
};

// ======================================================
// HELPER: GET USER AGENT
// ======================================================

const getUserAgent = (req) => {
  return req.headers["user-agent"] || "Unknown";
};

// ======================================================
// HELPER: CREATE ACTIVITY LOG
// ======================================================

const createActivityLog = async ({
  userId = null,
  action,
  description,
  entityType = null,
  entityId = null,
  ipAddress = null,
  userAgent = null,
}) => {
  try {
    const result = await pool.query(
      `
      INSERT INTO activity_logs (
        user_id,
        action,
        description,
        entity_type,
        entity_id,
        ip_address,
        user_agent
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
      `,
      [
        userId,
        action,
        description,
        entityType,
        entityId,
        ipAddress,
        userAgent,
      ]
    );

    return result.rows[0];
  } catch (error) {
    console.error(
      "CREATE ACTIVITY LOG ERROR:",
      error
    );

    return null;
  }
};

// ======================================================
// HELPER: CREATE SECURITY REPORT
// ======================================================

const createSecurityReport = async ({
  userId = null,
  attemptedEmail = null,
  eventType,
  severity,
  description,
  ipAddress = null,
  userAgent = null,
}) => {
  try {
    const result = await pool.query(
      `
      INSERT INTO security_reports (
        user_id,
        attempted_email,
        event_type,
        severity,
        description,
        ip_address,
        user_agent,
        status
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        'open'
      )
      RETURNING id
      `,
      [
        userId,
        attemptedEmail,
        eventType,
        severity,
        description,
        ipAddress,
        userAgent,
      ]
    );

    return result.rows[0].id;
  } catch (error) {
    console.error(
      "CREATE SECURITY REPORT ERROR:",
      error
    );

    return null;
  }
};

// ======================================================
// HELPER: CREATE RISK
// ======================================================

const createRisk = async ({
  userId = null,
  securityReportId = null,
  riskType,
  title,
  description,
  severity = "low",
  recommendedAction = null,
}) => {
  try {
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
        recommended_action,
        detected_at
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        'open',
        $7,
        CURRENT_TIMESTAMP
      )
      RETURNING *
      `,
      [
        userId,
        securityReportId,
        riskType,
        title,
        description,
        severity,
        recommendedAction,
      ]
    );

    return result.rows[0];
  } catch (error) {
    console.error(
      "CREATE RISK ERROR:",
      error
    );

    return null;
  }
};

// ======================================================
// HELPER: GET RECENT FAILED LOGIN COUNT
// ======================================================

const getRecentFailedLoginCount = async ({
  userId = null,
  email,
  ipAddress,
}) => {
  try {
    let result;

    if (userId) {
      result = await pool.query(
        `
        SELECT COUNT(*) AS attempt_count
        FROM security_reports
        WHERE user_id = $1
          AND event_type = 'failed_login'
          AND created_at >=
              CURRENT_TIMESTAMP -
              INTERVAL '${FAILED_LOGIN_WINDOW_MINUTES} minutes'
        `,
        [userId]
      );
    } else {
      result = await pool.query(
        `
        SELECT COUNT(*) AS attempt_count
        FROM security_reports
        WHERE attempted_email = $1
          AND event_type = 'failed_login'
          AND ip_address = $2
          AND created_at >=
              CURRENT_TIMESTAMP -
              INTERVAL '${FAILED_LOGIN_WINDOW_MINUTES} minutes'
        `,
        [email, ipAddress]
      );
    }

    return Number(
      result.rows[0]?.attempt_count || 0
    );
  } catch (error) {
    console.error(
      "GET FAILED LOGIN COUNT ERROR:",
      error
    );

    return 0;
  }
};

// ======================================================
// HELPER: CHECK EXISTING OPEN AUTHENTICATION RISK
// ======================================================

const checkExistingOpenRisk = async ({
  userId = null,
  email = null,
}) => {
  try {
    let result;

    if (userId) {
      result = await pool.query(
        `
        SELECT id
        FROM risks
        WHERE user_id = $1
          AND risk_type = 'Authentication'
          AND status IN ('open', 'reviewed')
        ORDER BY created_at DESC
        LIMIT 1
        `,
        [userId]
      );
    } else {
      result = await pool.query(
        `
        SELECT r.id
        FROM risks r
        INNER JOIN security_reports sr
          ON r.security_report_id = sr.id
        WHERE r.risk_type = 'Authentication'
          AND r.status IN ('open', 'reviewed')
          AND sr.attempted_email = $1
        ORDER BY r.created_at DESC
        LIMIT 1
        `,
        [email]
      );
    }

    if (result.rows.length > 0) {
      return result.rows[0].id;
    }

    return null;
  } catch (error) {
    console.error(
      "CHECK EXISTING RISK ERROR:",
      error
    );

    return null;
  }
};

// ======================================================
// HELPER: UPDATE USER FAILED ATTEMPT COUNTER
// ======================================================

const updateFailedAttemptCounter = async ({
  userId,
}) => {
  try {
    const result = await pool.query(
      `
      UPDATE users
      SET
        failed_login_attempts =
          CASE
            WHEN last_failed_login_at IS NULL
              OR last_failed_login_at <
                CURRENT_TIMESTAMP -
                INTERVAL '${FAILED_LOGIN_WINDOW_MINUTES} minutes'
            THEN 1

            ELSE COALESCE(failed_login_attempts, 0) + 1
          END,

        last_failed_login_at = CURRENT_TIMESTAMP

      WHERE id = $1

      RETURNING
        failed_login_attempts,
        last_failed_login_at
      `,
      [userId]
    );

    if (result.rows.length === 0) {
      return {
        count: 0,
        lastFailedLoginAt: null,
      };
    }

    return {
      count: Number(
        result.rows[0].failed_login_attempts || 0
      ),
      lastFailedLoginAt:
        result.rows[0].last_failed_login_at,
    };
  } catch (error) {
    console.error(
      "UPDATE FAILED ATTEMPT COUNTER ERROR:",
      error
    );

    return {
      count: 0,
      lastFailedLoginAt: null,
    };
  }
};

// ======================================================
// HELPER: RESET USER FAILED ATTEMPTS
// ======================================================

const resetFailedAttemptCounter = async ({
  userId,
}) => {
  try {
    await pool.query(
      `
      UPDATE users
      SET
        failed_login_attempts = 0,
        last_failed_login_at = NULL
      WHERE id = $1
      `,
      [userId]
    );
  } catch (error) {
    console.error(
      "RESET FAILED ATTEMPT COUNTER ERROR:",
      error
    );
  }
};

// ======================================================
// HELPER: HANDLE REPEATED LOGIN RISK
// ======================================================

const handleRepeatedLoginRisk = async ({
  userId = null,
  email,
  ipAddress,
  securityReportId,
  userName = null,
}) => {
  try {
    const attemptCount =
      await getRecentFailedLoginCount({
        userId,
        email,
        ipAddress,
      });

    // Risk only at threshold
    if (
      attemptCount <
      FAILED_LOGIN_THRESHOLD
    ) {
      return {
        riskCreated: false,
        attemptCount,
      };
    }

    // Prevent duplicate risks
    const existingRiskId =
      await checkExistingOpenRisk({
        userId,
        email,
      });

    if (existingRiskId) {
      return {
        riskCreated: false,
        existingRiskId,
        attemptCount,
      };
    }

    const risk = await createRisk({
      userId,
      securityReportId,
      riskType: "Authentication",
      title:
        "Repeated Failed Login Attempts",

      description: userId
        ? `The account ${
            userName || email
          } experienced ${attemptCount} failed login attempts within ${FAILED_LOGIN_WINDOW_MINUTES} minutes. This may indicate repeated incorrect password attempts or suspicious authentication activity.`
        : `The email address ${email} experienced ${attemptCount} failed login attempts from the IP address ${ipAddress} within ${FAILED_LOGIN_WINDOW_MINUTES} minutes.`,

      severity: "high",

      recommendedAction:
        "Review the authentication activity, verify whether the attempts are legitimate, and take corrective action if suspicious activity is confirmed.",
    });

    if (!risk) {
      return {
        riskCreated: false,
        attemptCount,
      };
    }

    // ==================================================
    // SEND EMAIL ONLY WHEN RISK IS CREATED
    // ==================================================

    if (userId && email) {
      await sendSecurityAlertEmail({
        email,
        fullname: userName,
        failedAttempts: attemptCount,
      });
    }

    return {
      riskCreated: true,
      riskId: risk.id,
      attemptCount,
    };
  } catch (error) {
    console.error(
      "HANDLE REPEATED LOGIN RISK ERROR:",
      error
    );

    return {
      riskCreated: false,
      attemptCount: 0,
    };
  }
};

// ======================================================
// REGISTER
// ======================================================

const register = async (req, res) => {
  try {
    const {
      fullname,
      email,
      password,
      role,
    } = req.body;

    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);

    if (
      !fullname ||
      !email ||
      !password ||
      !role
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Fullname, email, password and role are required.",
      });
    }

    const allowedRoles = [
      "freelancer",
      "client",
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role.",
      });
    }

    if (role === "admin") {
      return res.status(403).json({
        success: false,
        message:
          "Admin registration is not allowed.",
      });
    }

    if (
      email.trim().toLowerCase() ===
      "support@freelanceshield.com"
    ) {
      return res.status(403).json({
        success: false,
        message: "This email is reserved.",
      });
    }

    const existingUser = await pool.query(
      `
      SELECT id
      FROM users
      WHERE LOWER(email) = LOWER($1)
      `,
      [email.trim()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email already exists.",
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const result = await pool.query(
      `
      INSERT INTO users (
        fullname,
        email,
        password,
        role,
        account_status,
        failed_login_attempts,
        force_password_reset
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        'active',
        0,
        FALSE
      )
      RETURNING
        id,
        fullname,
        email,
        role,
        account_status,
        force_password_reset,
        created_at
      `,
      [
        fullname.trim(),
        email.trim().toLowerCase(),
        hashedPassword,
        role,
      ]
    );

    const newUser = result.rows[0];

    await createActivityLog({
      userId: newUser.id,
      action: "register",
      description:
        "User registered a new account.",
      entityType: "user",
      entityId: newUser.id,
      ipAddress,
      userAgent,
    });

    return res.status(201).json({
      success: true,
      message: "Registration Successful!",
      user: newUser,
    });
  } catch (error) {
    console.error(
      "REGISTER ERROR:",
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
// LOGIN
// ======================================================

const login = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required.",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    // ==================================================
    // FIND USER
    // ==================================================

    const result = await pool.query(
      `
      SELECT *
      FROM users
      WHERE LOWER(email) = LOWER($1)
      `,
      [normalizedEmail]
    );

    // ==================================================
    // UNKNOWN EMAIL
    // ==================================================

    if (result.rows.length === 0) {
      await createActivityLog({
        userId: null,
        action: "failed_login",
        description:
          `Failed login attempt using unknown email: ${normalizedEmail}`,
        entityType: "authentication",
        entityId: null,
        ipAddress,
        userAgent,
      });

      const securityReportId =
        await createSecurityReport({
          userId: null,
          attemptedEmail:
            normalizedEmail,
          eventType: "failed_login",
          severity: "medium",
          description:
            `Failed login attempt using an unregistered email address: ${normalizedEmail}.`,
          ipAddress,
          userAgent,
        });

      const riskResult =
        await handleRepeatedLoginRisk({
          userId: null,
          email: normalizedEmail,
          ipAddress,
          securityReportId,
        });

      const remainingAttempts =
        Math.max(
          FAILED_LOGIN_THRESHOLD -
            riskResult.attemptCount,
          0
        );

      let message =
        "User not found.";

      if (remainingAttempts > 0) {
        message =
          `User not found. ${remainingAttempts} attempt(s) remaining before additional security review.`;
      } else {
        message =
          "User not found. Multiple failed login attempts have been detected and the activity has been flagged for security review.";
      }

      return res.status(404).json({
        success: false,
        message,
        failedAttempts:
          riskResult.attemptCount,
        remainingAttempts,
        riskCreated:
          riskResult.riskCreated ||
          false,
      });
    }

    // ==================================================
    // GET USER
    // ==================================================

    const user = result.rows[0];

    // ==================================================
    // ACCOUNT STATUS
    // ==================================================

    if (
      user.account_status &&
      user.account_status !== "active"
    ) {
      await createActivityLog({
        userId: user.id,
        action: "blocked_login",
        description:
          `Login attempt blocked because account status is ${user.account_status}.`,
        entityType: "authentication",
        entityId: user.id,
        ipAddress,
        userAgent,
      });

      return res.status(403).json({
        success: false,
        message:
          "Your account is currently disabled. Please contact support.",
      });
    }

    // ==================================================
    // CHECK PASSWORD
    // ==================================================

    const isMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    // ==================================================
    // WRONG PASSWORD
    // ==================================================

    if (!isMatch) {
      const counterResult =
        await updateFailedAttemptCounter({
          userId: user.id,
        });

      const failedAttempts =
        counterResult.count;

      const remainingAttempts =
        Math.max(
          FAILED_LOGIN_THRESHOLD -
            failedAttempts,
          0
        );

      // ------------------------------------------------
      // ACTIVITY LOG
      // ------------------------------------------------

      await createActivityLog({
        userId: user.id,
        action: "failed_login",
        description:
          `Failed login attempt #${failedAttempts} for ${user.email}. Invalid password.`,
        entityType: "authentication",
        entityId: user.id,
        ipAddress,
        userAgent,
      });

      // ------------------------------------------------
      // SECURITY REPORT
      // ------------------------------------------------

      const securityReportId =
        await createSecurityReport({
          userId: user.id,
          attemptedEmail:
            normalizedEmail,
          eventType: "failed_login",

          severity:
            failedAttempts >=
            FAILED_LOGIN_THRESHOLD
              ? "high"
              : "medium",

          description:
            `Invalid password entered for ${user.email}. Failed attempt #${failedAttempts}.`,

          ipAddress,
          userAgent,
        });

      // ------------------------------------------------
      // CHECK / CREATE RISK
      // ------------------------------------------------

      const riskResult =
        await handleRepeatedLoginRisk({
          userId: user.id,
          email: normalizedEmail,
          ipAddress,
          securityReportId,
          userName: user.fullname,
        });

      // ------------------------------------------------
      // MESSAGE
      // ------------------------------------------------

      let loginMessage;

      if (remainingAttempts > 0) {
        loginMessage =
          `Invalid password. ${remainingAttempts} attempt(s) remaining before additional security review.`;
      } else if (
        riskResult.riskCreated
      ) {
        loginMessage =
          "Invalid password. Your repeated failed login attempts have been flagged for security review.";
      } else {
        loginMessage =
          "Invalid password. Your repeated failed login attempts have already been flagged for security review.";
      }

      return res.status(401).json({
        success: false,
        message: loginMessage,

        failedAttempts,

        remainingAttempts,

        riskCreated:
          riskResult.riskCreated ||
          false,

        riskAlreadyExists:
          Boolean(
            riskResult.existingRiskId
          ),
      });
    }

    // ==================================================
    // SUCCESSFUL LOGIN
    // ==================================================

    await resetFailedAttemptCounter({
      userId: user.id,
    });

    // ==================================================
    // CREATE JWT
    // ==================================================

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    // ==================================================
    // ACTIVITY LOG
    // ==================================================

    await createActivityLog({
      userId: user.id,
      action: "login",
      description:
        "User logged into the system successfully.",
      entityType: "authentication",
      entityId: user.id,
      ipAddress,
      userAgent,
    });

    // ==================================================
    // FORCE PASSWORD RESET
    // ==================================================

    const forcePasswordReset =
      user.force_password_reset === true;

    // ==================================================
    // SUCCESS RESPONSE
    // ==================================================

    return res.status(200).json({
      success: true,

      message: forcePasswordReset
        ? "Login successful. You must change your password."
        : "Login Successful!",

      token,

      forcePasswordReset,

      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(
      "LOGIN ERROR:",
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
// EXPORT
// ======================================================

module.exports = {
  register,
  login,
};