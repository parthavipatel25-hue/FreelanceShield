const pool = require("../config/db");

// ============================================
// GET ADMIN ACTIVITY LOGS WITH FILTERS
// ============================================

const getAdminActivityLogs = async (req, res) => {
  try {
    const {
      admin_id,
      action,
      role,
      user_id,
      search,
      start_date,
      end_date,
    } = req.query;

    // ============================================
    // ADMIN ID REQUIRED
    // ============================================

    if (!admin_id) {
      return res.status(400).json({
        success: false,
        message: "Admin ID is required.",
      });
    }

    // ============================================
    // CHECK ADMIN
    // ============================================

    const adminResult = await pool.query(
      `
      SELECT id, fullname, email, role
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
        message: "Only admins can view activity logs.",
      });
    }

    // ============================================
    // BASE QUERY
    // ============================================

    let query = `
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

      WHERE 1 = 1
    `;

    const values = [];
    let parameterIndex = 1;

    // ============================================
    // FILTER BY ACTION
    // ============================================

    if (action && action.trim() !== "") {
      query += `
        AND LOWER(al.action) = LOWER($${parameterIndex})
      `;

      values.push(action.trim());
      parameterIndex++;
    }

    // ============================================
    // FILTER BY ROLE
    // ============================================

    if (role && role.trim() !== "") {
      query += `
        AND LOWER(u.role) = LOWER($${parameterIndex})
      `;

      values.push(role.trim());
      parameterIndex++;
    }

    // ============================================
    // FILTER BY USER ID
    // ============================================

    if (user_id && user_id.trim() !== "") {
      const numericUserId = Number(user_id);

      if (Number.isNaN(numericUserId)) {
        return res.status(400).json({
          success: false,
          message: "User ID must be a valid number.",
        });
      }

      query += `
        AND al.user_id = $${parameterIndex}
      `;

      values.push(numericUserId);
      parameterIndex++;
    }

    // ============================================
    // SEARCH
    // ============================================

    if (search && search.trim() !== "") {
      query += `
        AND (
          LOWER(COALESCE(u.fullname, '')) LIKE LOWER($${parameterIndex})
          OR LOWER(COALESCE(u.email, '')) LIKE LOWER($${parameterIndex})
          OR LOWER(COALESCE(al.action, '')) LIKE LOWER($${parameterIndex})
          OR LOWER(COALESCE(al.description, '')) LIKE LOWER($${parameterIndex})
        )
      `;

      values.push(`%${search.trim()}%`);
      parameterIndex++;
    }

    // ============================================
    // START DATE
    // ============================================

    if (start_date && start_date.trim() !== "") {
      query += `
        AND al.created_at >= $${parameterIndex}::date
      `;

      values.push(start_date.trim());
      parameterIndex++;
    }

    // ============================================
    // END DATE
    // ============================================

    if (end_date && end_date.trim() !== "") {
      query += `
        AND al.created_at < ($${parameterIndex}::date + INTERVAL '1 day')
      `;

      values.push(end_date.trim());
      parameterIndex++;
    }

    // ============================================
    // ORDER
    // ============================================

    query += `
      ORDER BY
        al.created_at DESC,
        al.id DESC
    `;

    // ============================================
    // EXECUTE QUERY
    // ============================================

    const result = await pool.query(query, values);

    // ============================================
    // RESPONSE
    // ============================================

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      activities: result.rows,
    });
  } catch (error) {
    console.error(
      "GET ADMIN ACTIVITY LOGS ERROR:",
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
// GET ACTIVITY LOG SUMMARY
// ============================================

const getActivityLogSummary = async (req, res) => {
  try {
    const { admin_id } = req.query;

    // ============================================
    // ADMIN ID REQUIRED
    // ============================================

    if (!admin_id) {
      return res.status(400).json({
        success: false,
        message: "Admin ID is required.",
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
        message: "Only admins can view activity summary.",
      });
    }

    // ============================================
    // TOTAL ACTIVITIES
    // ============================================

    const totalResult = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM activity_logs
      `
    );

    // ============================================
    // TODAY'S ACTIVITIES
    // ============================================

    const todayResult = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM activity_logs
      WHERE created_at >= CURRENT_DATE
      `
    );

    // ============================================
    // LOGIN ACTIVITIES
    // ============================================

    const loginResult = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM activity_logs
      WHERE LOWER(action) = 'login'
      `
    );

    // ============================================
    // UNIQUE ACTIVE USERS
    // ============================================

    const usersResult = await pool.query(
      `
      SELECT COUNT(DISTINCT user_id) AS total
      FROM activity_logs
      WHERE user_id IS NOT NULL
      `
    );

    // ============================================
    // ACTION SUMMARY
    // ============================================

    const actionResult = await pool.query(
      `
      SELECT
        action,
        COUNT(*) AS count
      FROM activity_logs
      GROUP BY action
      ORDER BY COUNT(*) DESC
      `
    );

    // ============================================
    // ROLE SUMMARY
    // ============================================

    const roleResult = await pool.query(
      `
      SELECT
        COALESCE(u.role, 'system') AS role,
        COUNT(*) AS count
      FROM activity_logs al
      LEFT JOIN users u
        ON al.user_id = u.id
      GROUP BY COALESCE(u.role, 'system')
      ORDER BY COUNT(*) DESC
      `
    );

    // ============================================
    // RESPONSE
    // ============================================

    return res.status(200).json({
      success: true,

      summary: {
        total_activities: Number(
          totalResult.rows[0].total
        ),

        today_activities: Number(
          todayResult.rows[0].total
        ),

        login_activities: Number(
          loginResult.rows[0].total
        ),

        active_users: Number(
          usersResult.rows[0].total
        ),
      },

      action_summary: actionResult.rows,

      role_summary: roleResult.rows,
    });
  } catch (error) {
    console.error(
      "GET ACTIVITY LOG SUMMARY ERROR:",
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
// GET SINGLE ACTIVITY LOG
// ============================================

const getActivityLogById = async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_id } = req.query;

    // ============================================
    // REQUIRED
    // ============================================

    if (!admin_id) {
      return res.status(400).json({
        success: false,
        message: "Admin ID is required.",
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Activity log ID is required.",
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
        message: "Only admins can view activity logs.",
      });
    }

    // ============================================
    // GET ACTIVITY
    // ============================================

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

      WHERE al.id = $1
      `,
      [id]
    );

    // ============================================
    // NOT FOUND
    // ============================================

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Activity log not found.",
      });
    }

    // ============================================
    // RESPONSE
    // ============================================

    return res.status(200).json({
      success: true,
      activity: result.rows[0],
    });
  } catch (error) {
    console.error(
      "GET ACTIVITY LOG BY ID ERROR:",
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
  getAdminActivityLogs,
  getActivityLogSummary,
  getActivityLogById,
};