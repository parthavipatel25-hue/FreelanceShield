const pool = require("../config/db");

// ============================================
// CREATE SECURITY REPORT
// ============================================

const createSecurityReport = async (req, res) => {
  try {
    const {
      user_id,
      event_type,
      severity,
      description,
      ip_address,
      user_agent,
    } = req.body;

    // ============================================
    // REQUIRED FIELD
    // ============================================

    if (!event_type || !event_type.trim()) {
      return res.status(400).json({
        success: false,
        message: "Event type is required.",
      });
    }

    // ============================================
    // VALID SEVERITY
    // ============================================

    const allowedSeverity = [
      "low",
      "medium",
      "high",
      "critical",
    ];

    const selectedSeverity = severity
      ? severity.toLowerCase()
      : "low";

    if (!allowedSeverity.includes(selectedSeverity)) {
      return res.status(400).json({
        success: false,
        message:
          "Severity must be low, medium, high, or critical.",
      });
    }

    // ============================================
    // INSERT SECURITY REPORT
    // ============================================

    const result = await pool.query(
      `
      INSERT INTO security_reports (
        user_id,
        event_type,
        severity,
        description,
        ip_address,
        user_agent
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        user_id || null,
        event_type.trim(),
        selectedSeverity,
        description || null,
        ip_address || null,
        user_agent || null,
      ]
    );

    // ============================================
    // RESPONSE
    // ============================================

    return res.status(201).json({
      success: true,
      message: "Security report created successfully.",
      report: result.rows[0],
    });
  } catch (error) {
    console.error(
      "CREATE SECURITY REPORT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ============================================
// GET ALL SECURITY REPORTS
// ============================================

const getSecurityReports = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        sr.id,
        sr.user_id,

        u.fullname,
        u.email,
        u.role,

        sr.attempted_email,

        sr.event_type,
        sr.severity,
        sr.description,
        sr.ip_address,
        sr.user_agent,
        sr.status,
        sr.resolved_by,
        sr.resolved_at,
        sr.created_at

      FROM security_reports sr

      LEFT JOIN users u
        ON sr.user_id = u.id

      ORDER BY
        sr.created_at DESC,
        sr.id DESC
      `
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      reports: result.rows,
    });

  } catch (error) {
    console.error(
      "GET SECURITY REPORTS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ============================================
// GET SECURITY REPORT BY ID
// ============================================

const getSecurityReportById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message:
          "Security report ID is required.",
      });
    }

    const result = await pool.query(
      `
      SELECT
        sr.id,
        sr.user_id,

        u.fullname,
        u.email,
        u.role,

        sr.attempted_email,

        sr.event_type,
        sr.severity,
        sr.description,
        sr.ip_address,
        sr.user_agent,
        sr.status,
        sr.resolved_by,
        sr.resolved_at,
        sr.created_at

      FROM security_reports sr

      LEFT JOIN users u
        ON sr.user_id = u.id

      WHERE sr.id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Security report not found.",
      });
    }

    return res.status(200).json({
      success: true,
      report: result.rows[0],
    });

  } catch (error) {
    console.error(
      "GET SECURITY REPORT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ============================================
// UPDATE SECURITY REPORT STATUS
// ============================================

const updateSecurityReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      admin_id,
      status,
    } = req.body;

    // ============================================
    // REQUIRED FIELDS
    // ============================================

    if (!id || !admin_id || !status) {
      return res.status(400).json({
        success: false,
        message:
          "Report ID, Admin ID, and status are required.",
      });
    }

    // ============================================
    // CHECK ADMIN
    // ============================================

    const adminResult = await pool.query(
      `
      SELECT id, role
      FROM users
      WHERE id = $1
      `,
      [admin_id]
    );

    if (adminResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Admin user not found.",
      });
    }

    if (adminResult.rows[0].role !== "admin") {
      return res.status(403).json({
        success: false,
        message:
          "Only admins can update security reports.",
      });
    }

    // ============================================
    // VALID STATUS
    // ============================================

    const allowedStatus = [
      "open",
      "investigating",
      "resolved",
      "dismissed",
    ];

    const selectedStatus = status.toLowerCase();

    if (!allowedStatus.includes(selectedStatus)) {
      return res.status(400).json({
        success: false,
        message:
          "Status must be open, investigating, resolved, or dismissed.",
      });
    }

    // ============================================
    // CHECK REPORT
    // ============================================

    const reportResult = await pool.query(
      `
      SELECT *
      FROM security_reports
      WHERE id = $1
      `,
      [id]
    );

    if (reportResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Security report not found.",
      });
    }

    // ============================================
    // UPDATE REPORT
    // ============================================

    let result;

    if (selectedStatus === "resolved") {
      result = await pool.query(
        `
        UPDATE security_reports
        SET
          status = $1,
          resolved_by = $2,
          resolved_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING *
        `,
        [
          selectedStatus,
          admin_id,
          id,
        ]
      );
    } else {
      result = await pool.query(
        `
        UPDATE security_reports
        SET
          status = $1,
          resolved_by = NULL,
          resolved_at = NULL
        WHERE id = $2
        RETURNING *
        `,
        [
          selectedStatus,
          id,
        ]
      );
    }

    // ============================================
    // RESPONSE
    // ============================================

    return res.status(200).json({
      success: true,
      message:
        "Security report status updated successfully.",
      report: result.rows[0],
    });
  } catch (error) {
    console.error(
      "UPDATE SECURITY REPORT STATUS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ============================================
// GET SECURITY REPORT SUMMARY
// ============================================

const getSecurityReportSummary = async (req, res) => {
  try {
    // ============================================
    // TOTAL REPORTS
    // ============================================

    const totalResult = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM security_reports
      `
    );

    // ============================================
    // OPEN REPORTS
    // ============================================

    const openResult = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM security_reports
      WHERE status = 'open'
      `
    );

    // ============================================
    // INVESTIGATING REPORTS
    // ============================================

    const investigatingResult = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM security_reports
      WHERE status = 'investigating'
      `
    );

    // ============================================
    // RESOLVED REPORTS
    // ============================================

    const resolvedResult = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM security_reports
      WHERE status = 'resolved'
      `
    );

    // ============================================
    // CRITICAL REPORTS
    // ============================================

    const criticalResult = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM security_reports
      WHERE severity = 'critical'
      `
    );

    // ============================================
    // SEVERITY SUMMARY
    // ============================================

    const severityResult = await pool.query(
      `
      SELECT
        severity,
        COUNT(*) AS count
      FROM security_reports
      GROUP BY severity
      ORDER BY count DESC
      `
    );

    // ============================================
    // EVENT TYPE SUMMARY
    // ============================================

    const eventResult = await pool.query(
      `
      SELECT
        event_type,
        COUNT(*) AS count
      FROM security_reports
      GROUP BY event_type
      ORDER BY count DESC
      `
    );

    // ============================================
    // RESPONSE
    // ============================================

    return res.status(200).json({
      success: true,

      summary: {
        total_reports:
          Number(totalResult.rows[0].total),

        open_reports:
          Number(openResult.rows[0].total),

        investigating_reports:
          Number(
            investigatingResult.rows[0].total
          ),

        resolved_reports:
          Number(resolvedResult.rows[0].total),

        critical_reports:
          Number(criticalResult.rows[0].total),
      },

      severity_summary:
        severityResult.rows,

      event_summary:
        eventResult.rows,
    });
  } catch (error) {
    console.error(
      "GET SECURITY REPORT SUMMARY ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ============================================
// EXPORT
// ============================================

module.exports = {
  createSecurityReport,
  getSecurityReports,
  getSecurityReportById,
  updateSecurityReportStatus,
  getSecurityReportSummary,
};