
const pool = require("../config/db");

// GET /api/admin/projects
const getAllAdminProjects = async (req, res) => {
  try {
    const {
      search = "",
      status = "",
      page = "1",
      limit = "10",
    } = req.query;

    const currentPage = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt(limit, 10) || 10)
    );
    const offset = (currentPage - 1) * pageSize;

    const conditions = [];
    const values = [];

    if (search.trim()) {
      values.push(`%${search.trim()}%`);
      conditions.push(
        `(p.title ILIKE $${values.length}
          OR p.description ILIKE $${values.length}
          OR p.category ILIKE $${values.length}
          OR p.id::text ILIKE $${values.length})`
      );
    }

    if (status.trim()) {
      values.push(status.trim());
      conditions.push(`p.status = $${values.length}`);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS total
       FROM projects p
       ${whereClause}`,
      values
    );

    const projectsResult = await pool.query(
      `SELECT
         p.id,
         p.title,
         p.description,
         p.category,
         p.skills,
         p.budget,
         p.budget_type,
         p.deadline,
         p.status,
         p.progress,
         p.client_id,
         p.freelancer_id,
         p.created_at,
         p.updated_at
       FROM projects p
       ${whereClause}
       ORDER BY p.id DESC
       LIMIT $${values.length + 1}
       OFFSET $${values.length + 2}`,
      [...values, pageSize, offset]
    );

    return res.status(200).json({
      success: true,
      projects: projectsResult.rows,
      pagination: {
        page: currentPage,
        limit: pageSize,
        total: countResult.rows[0].total,
        totalPages: Math.ceil(
          countResult.rows[0].total / pageSize
        ),
      },
    });
  } catch (error) {
    console.error("Admin Get Projects Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve projects.",
    });
  }
};

module.exports = {
  getAllAdminProjects,
};
