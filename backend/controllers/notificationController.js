const pool = require("../config/db");

// ============================================
// CREATE NOTIFICATION
// ============================================

const createNotification = async (req, res) => {
  try {
    const {
      user_id,
      type,
      title,
      message,
      reference_id,
    } = req.body;

    // ============================================
    // VALIDATION
    // ============================================

    if (!user_id || !type || !title || !message) {
      return res.status(400).json({
        success: false,
        message:
          "User ID, type, title, and message are required.",
      });
    }

    // ============================================
    // CHECK USER
    // ============================================

    const userResult = await pool.query(
      `
      SELECT id
      FROM users
      WHERE id = $1
      `,
      [user_id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // ============================================
    // CREATE NOTIFICATION
    // ============================================

    const result = await pool.query(
      `
      INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        reference_id
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [
        user_id,
        type,
        title,
        message,
        reference_id || null,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Notification created successfully.",
      notification: result.rows[0],
    });
  } catch (error) {
    console.error(
      "CREATE NOTIFICATION ERROR:",
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
// GET USER NOTIFICATIONS
// ============================================

const getUserNotifications = async (req, res) => {
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
      SELECT *
      FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC, id DESC
      `,
      [user_id]
    );

    return res.status(200).json({
      success: true,
      notifications: result.rows,
    });
  } catch (error) {
    console.error(
      "GET USER NOTIFICATIONS ERROR:",
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
// GET UNREAD NOTIFICATION COUNT
// ============================================

const getUnreadNotificationCount = async (req, res) => {
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
      SELECT COUNT(*)::INTEGER AS count
      FROM notifications
      WHERE user_id = $1
        AND is_read = FALSE
      `,
      [user_id]
    );

    return res.status(200).json({
      success: true,
      count: result.rows[0].count,
    });
  } catch (error) {
    console.error(
      "GET UNREAD NOTIFICATION COUNT ERROR:",
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
// MARK NOTIFICATION AS READ
// ============================================

const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      UPDATE notifications
      SET is_read = TRUE
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read.",
      notification: result.rows[0],
    });
  } catch (error) {
    console.error(
      "MARK NOTIFICATION AS READ ERROR:",
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
// MARK ALL USER NOTIFICATIONS AS READ
// ============================================

const markAllNotificationsAsRead = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    await pool.query(
      `
      UPDATE notifications
      SET is_read = TRUE
      WHERE user_id = $1
        AND is_read = FALSE
      `,
      [user_id]
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read.",
    });
  } catch (error) {
    console.error(
      "MARK ALL NOTIFICATIONS AS READ ERROR:",
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
// DELETE NOTIFICATION
// ============================================

const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM notifications
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE NOTIFICATION ERROR:",
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
  createNotification,
  getUserNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
};