const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// ======================================================
// HELPER: GET CLIENT IP ADDRESS
// ======================================================

const getClientIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  return (
    req.socket?.remoteAddress ||
    req.ip ||
    "Unknown"
  );
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

    console.log(
      "ACTIVITY LOG CREATED:",
      result.rows[0]
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
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'open')
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

    const securityReportId =
      result.rows[0].id;

    console.log(
      "SECURITY REPORT CREATED:",
      securityReportId
    );

    return securityReportId;

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

    console.log(
      "RISK CREATED:",
      result.rows[0]
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

    // --------------------------------------------------
    // VALIDATE REQUIRED FIELDS
    // --------------------------------------------------

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

    // --------------------------------------------------
    // PREVENT ADMIN REGISTRATION
    // --------------------------------------------------

    if (role === "admin") {
      return res.status(403).json({
        success: false,
        message:
          "Admin registration is not allowed.",
      });
    }

    // --------------------------------------------------
    // RESERVED EMAIL
    // --------------------------------------------------

    if (
      email.trim().toLowerCase() ===
      "support@freelanceshield.com"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "This email is reserved.",
      });
    }

    // --------------------------------------------------
    // CHECK EXISTING USER
    // --------------------------------------------------

    const existingUser =
      await pool.query(
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
        message:
          "Email already exists.",
      });
    }

    // --------------------------------------------------
    // HASH PASSWORD
    // --------------------------------------------------

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    // --------------------------------------------------
    // CREATE USER
    // --------------------------------------------------

    const result =
      await pool.query(
        `
        INSERT INTO users (
          fullname,
          email,
          password,
          role
        )
        VALUES ($1, $2, $3, $4)
        RETURNING
          id,
          fullname,
          email,
          role,
          created_at
        `,
        [
          fullname.trim(),
          email.trim().toLowerCase(),
          hashedPassword,
          role,
        ]
      );

    const newUser =
      result.rows[0];

    // --------------------------------------------------
    // ACTIVITY LOG
    // --------------------------------------------------

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

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    return res.status(201).json({
      success: true,

      message:
        "Registration Successful!",

      user: newUser,
    });

  } catch (error) {
    console.error(
      "REGISTER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server Error",
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

    const ipAddress =
      getClientIp(req);

    const userAgent =
      getUserAgent(req);

    // --------------------------------------------------
    // VALIDATE INPUT
    // --------------------------------------------------

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required.",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    // --------------------------------------------------
    // FIND USER
    // --------------------------------------------------

    const result =
      await pool.query(
        `
        SELECT *
        FROM users
        WHERE LOWER(email) = LOWER($1)
        `,
        [normalizedEmail]
      );

    // ==================================================
    // CASE 1:
    // EMAIL DOES NOT EXIST
    // ==================================================

    if (result.rows.length === 0) {

      // -----------------------------------------------
      // ACTIVITY LOG
      // -----------------------------------------------

      await createActivityLog({
        userId: null,

        action:
          "failed_login",

        description:
          `Failed login attempt using unknown email: ${normalizedEmail}`,

        entityType:
          "authentication",

        entityId: null,

        ipAddress,

        userAgent,
      });

      // -----------------------------------------------
      // SECURITY REPORT
      // -----------------------------------------------

      const securityReportId =
        await createSecurityReport({
          userId: null,

          attemptedEmail:
            normalizedEmail,

          eventType:
            "failed_login",

          severity:
            "medium",

          description:
            `Failed login attempt using an unregistered email address: ${normalizedEmail}`,

          ipAddress,

          userAgent,
        });

      // -----------------------------------------------
      // CREATE RISK
      // -----------------------------------------------

      if (securityReportId) {

        const risk =
          await createRisk({
            userId: null,

            securityReportId,

            riskType:
              "Authentication",

            title:
              "Failed Login Attempt",

            description:
              `An unsuccessful login attempt was detected using the unregistered email address ${normalizedEmail}.`,

            severity:
              "medium",

            recommendedAction:
              "Review the login attempt and monitor the source IP address for repeated suspicious login attempts.",
          });

        if (!risk) {
          console.error(
            "RISK WAS NOT CREATED FOR SECURITY REPORT:",
            securityReportId
          );
        }

      } else {
        console.error(
          "RISK NOT CREATED BECAUSE SECURITY REPORT CREATION FAILED."
        );
      }

      // -----------------------------------------------
      // RESPONSE
      // -----------------------------------------------

      return res.status(404).json({
        success: false,

        message:
          "User not found.",
      });
    }

    // --------------------------------------------------
    // GET USER
    // --------------------------------------------------

    const user =
      result.rows[0];

    // ==================================================
    // CASE 2:
    // PASSWORD IS WRONG
    // ==================================================

    const isMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isMatch) {

      // -----------------------------------------------
      // ACTIVITY LOG
      // -----------------------------------------------

      await createActivityLog({
        userId:
          user.id,

        action:
          "failed_login",

        description:
          `Failed login attempt for ${user.email}. Invalid password.`,

        entityType:
          "authentication",

        entityId:
          user.id,

        ipAddress,

        userAgent,
      });

      // -----------------------------------------------
      // SECURITY REPORT
      // -----------------------------------------------

      const securityReportId =
        await createSecurityReport({
          userId:
            user.id,

          attemptedEmail:
            normalizedEmail,

          eventType:
            "failed_login",

          severity:
            "medium",

          description:
            `Invalid password entered for ${user.email}.`,

          ipAddress,

          userAgent,
        });

      // -----------------------------------------------
      // CREATE RISK
      // -----------------------------------------------

      if (securityReportId) {

        const risk =
          await createRisk({
            userId:
              user.id,

            securityReportId,

            riskType:
              "Authentication",

            title:
              "Invalid Password Attempt",

            description:
              `A failed login attempt was detected for ${user.fullname} (${user.email}) because an incorrect password was entered.`,

            severity:
              "medium",

            recommendedAction:
              "Monitor this account for repeated failed login attempts and investigate if suspicious activity continues.",
          });

        if (!risk) {
          console.error(
            "RISK WAS NOT CREATED FOR SECURITY REPORT:",
            securityReportId
          );
        }

      } else {
        console.error(
          "RISK NOT CREATED BECAUSE SECURITY REPORT CREATION FAILED."
        );
      }

      // -----------------------------------------------
      // RESPONSE
      // -----------------------------------------------

      return res.status(401).json({
        success: false,

        message:
          "Invalid Password",
      });
    }

    // ==================================================
    // CASE 3:
    // SUCCESSFUL LOGIN
    // ==================================================

    // --------------------------------------------------
    // CREATE JWT
    // --------------------------------------------------

    const token =
      jwt.sign(
        {
          id: user.id,
          role: user.role,
        },

        process.env.JWT_SECRET,

        {
          expiresIn:
            "1d",
        }
      );

    // --------------------------------------------------
    // ACTIVITY LOG
    // --------------------------------------------------

    await createActivityLog({
      userId:
        user.id,

      action:
        "login",

      description:
        "User logged into the system.",

      entityType:
        "authentication",

      entityId:
        user.id,

      ipAddress,

      userAgent,
    });

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    return res.status(200).json({
      success: true,

      message:
        "Login Successful!",

      token,

      user: {
        id:
          user.id,

        fullname:
          user.fullname,

        email:
          user.email,

        role:
          user.role,
      },
    });

  } catch (error) {

    console.error(
      "LOGIN ERROR:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Server Error",
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