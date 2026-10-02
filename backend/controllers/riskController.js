const pool = require("../config/db");

// ============================================
// GET ALL RISKS
// ============================================

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

// ============================================
// GET SINGLE RISK
// ============================================

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

// ============================================
// CREATE RISK
// ============================================

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

    // ============================================
    // REQUIRED FIELDS
    // ============================================

    if (
      !risk_type ||
      !title ||
      !description ||
      !severity
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    // ============================================
    // VALIDATE SEVERITY
    // ============================================

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

    // ============================================
    // INSERT RISK
    // ============================================

    const result = await pool.query(
      `
      INSERT INTO risks (
        user_id,
        security_report_id,
        risk_type,
        title,
        description,
        severity,
        recommended_action
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
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

// ============================================
// UPDATE RISK STATUS
// ============================================

const updateRiskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_id } = req.body;

    // ============================================
    // VALIDATE STATUS
    // ============================================

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

    // ============================================
    // CHECK ADMIN
    // ============================================

    if (!admin_id) {
      return res.status(400).json({
        success: false,
        message: "Admin ID is required.",
      });
    }

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
        message: "Admin not found.",
      });
    }

    if (adminResult.rows[0].role !== "admin") {
      return res.status(403).json({
        success: false,
        message:
          "Only administrators can update risk status.",
      });
    }

    // ============================================
    // CHECK RISK
    // ============================================

    const existingRisk = await pool.query(
      `
      SELECT id
      FROM risks
      WHERE id = $1
      `,
      [id]
    );

    if (existingRisk.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Risk not found.",
      });
    }

    // ============================================
    // UPDATE REVIEWED STATUS
    // ============================================

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

    // ============================================
    // UPDATE RESOLVED STATUS
    // ============================================

    if (status === "resolved") {
      const result = await pool.query(
        `
        UPDATE risks
        SET
          status = 'resolved',
          resolved_by = $1,
          resolved_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
        `,
        [admin_id, id]
      );

      return res.status(200).json({
        success: true,
        message: "Risk resolved successfully.",
        risk: result.rows[0],
      });
    }

    // ============================================
    // REOPEN RISK
    // ============================================

    const result = await pool.query(
      `
      UPDATE risks
      SET
        status = 'open',
        reviewed_by = NULL,
        reviewed_at = NULL,
        resolved_by = NULL,
        resolved_at = NULL,
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
  } catch (error) {
    console.error("UPDATE RISK STATUS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ============================================
// DELETE RISK
// ============================================

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
    console.error("DELETE RISK ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ============================================
// RISK SUMMARY
// ============================================

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
    console.error("GET RISK SUMMARY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ============================================
// EXPORTS
// ============================================

module.exports = {
  getAllRisks,
  getRiskById,
  createRisk,
  updateRiskStatus,
  deleteRisk,
  getRiskSummary,
};