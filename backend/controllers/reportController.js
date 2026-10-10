
const pool = require("../config/db");

// GET /api/admin/reports
const getAllReports = async (req, res) => {
  try {
    const {
      status = "",
      search = "",
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

    if (status) {
      values.push(status);
      conditions.push(`r.status = $${values.length}`);
    }

    if (search.trim()) {
      values.push(`%${search.trim()}%`);
      conditions.push(
        `(r.reason ILIKE $${values.length} OR r.description ILIKE $${values.length})`
      );
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS total FROM reports r ${whereClause}`,
      values
    );

    const reportsResult = await pool.query(
      `SELECT
         r.id,
         r.reporter_id,
         r.reported_user_id,
         r.project_id,
         r.reason,
         r.description,
         r.status,
         r.admin_notes,
         r.created_at,
         r.updated_at
       FROM reports r
       ${whereClause}
       ORDER BY r.created_at DESC
       LIMIT $${values.length + 1}
       OFFSET $${values.length + 2}`,
      [...values, pageSize, offset]
    );

    const total = countResult.rows[0].total;

    res.json({
      success: true,
      reports: reportsResult.rows,
      pagination: {
        page: currentPage,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("GET ADMIN REPORTS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch reports.",
    });
  }
};

const createReport = async (req, res) => {
  try {
    const reporterId = req.user.id;
    const {
      reported_user_id,
      project_id,
      reason,
      description,
    } = req.body;

    if (!reason || !description?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Reason and description are required.",
      });
    }

    if (!project_id) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required.",
      });
    }

    const projectResult = await pool.query(
      "SELECT id, client_id FROM projects WHERE id = $1",
      [project_id]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    const project = projectResult.rows[0];
    const reportedUserId = reported_user_id || project.client_id;

    if (Number(reportedUserId) !== Number(project.client_id)) {
      return res.status(400).json({
        success: false,
        message: "The reported user must be the project owner.",
      });
    }

    const result = await pool.query(
      `INSERT INTO reports
        (reporter_id, reported_user_id, project_id, reason, description)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        reporterId,
        reportedUserId,
        project.id,
        reason,
        description.trim(),
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Report submitted successfully.",
      report: result.rows[0],
    });
  } catch (error) {
    console.error("CREATE REPORT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit report.",
    });
  }
};
// PATCH /api/admin/reports/:id/status

const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    const allowedStatuses = [
      "pending",
      "reviewing",
      "resolved",
      "dismissed",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid report status.",
      });
    }

    // Update the report
    const result = await pool.query(
      `UPDATE reports
       SET status = $1,
           admin_notes = COALESCE($2, admin_notes),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [status, admin_notes ?? null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Report not found.",
      });
    }

    const report = result.rows[0];

    // Notify the report submitter when the report is resolved or dismissed
    if (["resolved", "dismissed"].includes(status)) {
      const title =
        status === "resolved"
          ? "Your report has been resolved"
          : "Your report has been dismissed";

      const message =
        status === "resolved"
          ? `Your report #${report.id} has been reviewed and resolved by the admin.`
          : `Your report #${report.id} has been reviewed and dismissed by the admin.`;

      await pool.query(
        `INSERT INTO notifications
          (user_id, type, title, message, reference_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          report.reporter_id,
          "report_status",
          title,
          message,
          report.id,
        ]
      );
    }

    return res.json({
      success: true,
      message: "Report status updated successfully.",
      report,
    });
  } catch (error) {
    console.error("UPDATE REPORT STATUS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update report status.",
    });
  }
};


module.exports = {
  getAllReports,
  createReport,
   updateReportStatus,
};
