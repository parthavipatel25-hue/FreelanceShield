const pool = require("../config/db");

// GET /api/admin/dashboard-stats
const getAdminDashboardStats = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*)::int AS total_users,
        COUNT(*) FILTER (
          WHERE role = 'freelancer'
        )::int AS freelancers,
        COUNT(*) FILTER (
          WHERE role = 'client'
        )::int AS clients
      FROM users
    `);

    const projectResult = await pool.query(`
      SELECT COUNT(*)::int AS projects
      FROM projects
    `);

    const stats = {
      totalUsers: result.rows[0].total_users,
      freelancers: result.rows[0].freelancers,
      clients: result.rows[0].clients,
      projects: projectResult.rows[0].projects,
    };

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error(
      "ADMIN DASHBOARD STATS ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch admin dashboard statistics.",
    });
  }
};

module.exports = {
  getAdminDashboardStats,
};