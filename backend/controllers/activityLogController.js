const pool = require("../config/db");

// ============================================
// CREATE ACTIVITY LOG
// ============================================

const createActivityLog = async (req, res) => {
  try {
    const {
      user_id,
      action,
      description,
      entity_type,
      entity_id,
      ip_address,
      user_agent,
    } = req.body;

    // ============================================
    // REQUIRED FIELD
    // ============================================

    if (!action || !action.trim()) {
      return res.status(400).json({
        success: false,
        message: "Action is required.",
      });
    }

    // ============================================
    // INSERT ACTIVITY LOG
    // ============================================

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
      RETURNING *
      `,
      [
        user_id || null,
        action.trim(),
        description || null,
        entity_type || null,
        entity_id || null,
        ip_address || null,
        user_agent || null,
      ]
    );

    // ============================================
    // RESPONSE
    // ============================================

    return res.status(201).json({
      success: true,
      message: "Activity log created successfully.",
      activity: result.rows[0],
    });
  } catch (error) {
    console.error("CREATE ACTIVITY LOG ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ============================================
// GET ACTIVITY LOGS
// ============================================

const getActivityLogs = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        al.id,
        al.user_id,
        u.fullname,
        u.email,
        u.role,
        al.action,
        al.description,
        al.entity_type,
        al.entity_id,
        al.ip_address,
        al.user_agent,
        al.created_at
      FROM activity_logs al

      LEFT JOIN users u
        ON al.user_id = u.id

      ORDER BY al.created_at DESC, al.id DESC
      `
    );

    return res.status(200).json({
      success: true,
      activities: result.rows,
    });
  } catch (error) {
    console.error("GET ACTIVITY LOGS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ============================================
// GET ACTIVITY LOGS FOR ONE USER
// ============================================

const getUserActivityLogs = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    const result = await pool.query(
      `
      SELECT
        al.id,
        al.user_id,
        u.fullname,
        u.email,
        u.role,
        al.action,
        al.description,
        al.entity_type,
        al.entity_id,
        al.ip_address,
        al.user_agent,
        al.created_at
      FROM activity_logs al

      LEFT JOIN users u
        ON al.user_id = u.id

      WHERE al.user_id = $1

      ORDER BY al.created_at DESC, al.id DESC
      `,
      [user_id]
    );

    return res.status(200).json({
      success: true,
      activities: result.rows,
    });
  } catch (error) {
    console.error("GET USER ACTIVITY LOGS ERROR:", error);

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
  createActivityLog,
  getActivityLogs,
  getUserActivityLogs,
};