const pool = require("../config/db");

// ======================================================
// GET ALL USERS — ADMIN USER MANAGEMENT
// ======================================================

const getAllUsers = async (req, res) => {
  try {
    const {
      search = "",
      role = "",
      status = "",
      page = "1",
      limit = "10",
    } = req.query;

    const pageNumber = Math.max(
      parseInt(page, 10) || 1,
      1
    );

    const limitNumber = Math.min(
      Math.max(parseInt(limit, 10) || 10, 1),
      100
    );

    const offset = (pageNumber - 1) * limitNumber;

    const conditions = [];
    const values = [];

    if (search.trim()) {
      values.push(`%${search.trim()}%`);

      conditions.push(`
        (
          fullname ILIKE $${values.length}
          OR email ILIKE $${values.length}
        )
      `);
    }

    if (role) {
      values.push(role.toLowerCase());
      conditions.push(
        `role = $${values.length}`
      );
    }

    if (status) {
      values.push(status.toLowerCase());
      conditions.push(
        `account_status = $${values.length}`
      );
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const countResult = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM users
      ${whereClause}
      `,
      values
    );

    const total = Number(
      countResult.rows[0].total
    );

    const usersResult = await pool.query(
      `
      SELECT
        id,
        fullname,
        email,
        role,
        account_status,
        created_at,
        updated_at
      FROM users
      ${whereClause}
      ORDER BY created_at DESC, id DESC
      LIMIT $${values.length + 1}
      OFFSET $${values.length + 2}
      `,
      [...values, limitNumber, offset]
    );

    return res.status(200).json({
      success: true,
      users: usersResult.rows,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(
          total / limitNumber
        ),
      },
    });
  } catch (error) {
    console.error(
      "GET ALL USERS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve users.",
    });
  }
};

// ======================================================
// UPDATE USER ACCOUNT STATUS — ADMIN
// ======================================================

const updateUserStatus = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { account_status } = req.body;

    const allowedStatuses = [
      "active",
      "suspended",
      "disabled",
    ];

    if (
      !Number.isInteger(userId) ||
      userId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    if (
      !allowedStatuses.includes(
        account_status
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Account status must be active, suspended, or disabled.",
      });
    }

    // Prevent an administrator from disabling
    // their own account through this endpoint.
    if (
      Number(req.user.id) === userId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot change your own account status here.",
      });
    }

    const existingResult = await pool.query(
      `
      SELECT id, fullname, role, account_status
      FROM users
      WHERE id = $1
      `,
      [userId]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const existingUser =
      existingResult.rows[0];

    const updateResult = await pool.query(
      `
      UPDATE users
      SET
        account_status = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING
        id,
        fullname,
        email,
        role,
        account_status,
        updated_at
      `,
      [account_status, userId]
    );

    // Record the administrative action.
    await pool.query(
      `
      INSERT INTO activity_logs (
        user_id,
        action,
        description,
        entity_type,
        entity_id
      )
      VALUES ($1, $2, $3, $4, $5)
      `,
      [
        req.user.id,
        "admin_update_user_status",
        `Admin changed account status for user ${userId} from ${existingUser.account_status} to ${account_status}.`,
        "user",
        userId,
      ]
    );

    return res.status(200).json({
      success: true,
      message: "User account status updated.",
      user: updateResult.rows[0],
    });
  } catch (error) {
    console.error(
      "UPDATE USER STATUS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update user account status.",
    });
  }
};

module.exports = {
  getAllUsers,
  updateUserStatus,
};