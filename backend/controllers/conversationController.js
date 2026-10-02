const pool = require("../config/db");

// ============================================
// GET OR CREATE CONVERSATION
// ============================================

const getOrCreateConversation = async (req, res) => {
  try {
    const { project_id, client_id, freelancer_id } = req.body;

    // ============================================
    // VALIDATION
    // ============================================

    if (!project_id || !client_id || !freelancer_id) {
      return res.status(400).json({
        success: false,
        message:
          "Project ID, client ID and freelancer ID are required.",
      });
    }

    // ============================================
    // CHECK PROJECT
    // ============================================

    const projectResult = await pool.query(
      `
      SELECT
        p.id,
        p.client_id,
        p.freelancer_id,
        p.title,
        p.status,
        cp.user_id AS client_user_id
      FROM projects p
      JOIN client_profiles cp
        ON p.client_id = cp.id
      WHERE p.id = $1
      `,
      [project_id]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    const project = projectResult.rows[0];

    // ============================================
    // VERIFY CLIENT
    // ============================================

    if (Number(project.client_user_id) !== Number(client_id)) {
      return res.status(403).json({
        success: false,
        message:
          "The selected client does not belong to this project.",
      });
    }

    // ============================================
    // VERIFY FREELANCER
    // ============================================

    if (
      !project.freelancer_id ||
      Number(project.freelancer_id) !== Number(freelancer_id)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "This freelancer is not assigned to this project.",
      });
    }

    // ============================================
    // CHECK EXISTING CONVERSATION
    // ============================================

    const existingConversation = await pool.query(
      `
      SELECT
        id,
        project_id,
        client_id,
        freelancer_id,
        created_at,
        updated_at
      FROM conversations
      WHERE project_id = $1
      `,
      [project_id]
    );

    if (existingConversation.rows.length > 0) {
      return res.status(200).json({
        success: true,
        message: "Conversation already exists.",
        conversation: existingConversation.rows[0],
      });
    }

    // ============================================
    // CREATE CONVERSATION
    // ============================================

    const result = await pool.query(
      `
      INSERT INTO conversations (
        project_id,
        client_id,
        freelancer_id
      )
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [
        project_id,
        client_id,
        freelancer_id,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Conversation created successfully.",
      conversation: result.rows[0],
    });
  } catch (error) {
    console.error(
      "GET OR CREATE CONVERSATION ERROR:",
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
// GET USER CONVERSATIONS
// ============================================

const getUserConversations = async (req, res) => {
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
        c.id,
        c.project_id,
        c.client_id,
        c.freelancer_id,
        c.created_at,
        c.updated_at,

        p.title AS project_title,
        p.status AS project_status,

        client.fullname AS client_name,
        client.email AS client_email,

        freelancer.fullname AS freelancer_name,
        freelancer.email AS freelancer_email

      FROM conversations c

      JOIN projects p
        ON c.project_id = p.id

      JOIN users client
        ON c.client_id = client.id

      JOIN users freelancer
        ON c.freelancer_id = freelancer.id

      WHERE
        c.client_id = $1
        OR c.freelancer_id = $1

      ORDER BY c.updated_at DESC
      `,
      [user_id]
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      conversations: result.rows,
    });
  } catch (error) {
    console.error(
      "GET USER CONVERSATIONS ERROR:",
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
// GET SINGLE CONVERSATION
// ============================================

const getConversationById = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Conversation ID is required.",
      });
    }

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    // ============================================
    // GET CONVERSATION
    // ============================================

    const conversationResult = await pool.query(
      `
      SELECT
        c.id,
        c.project_id,
        c.client_id,
        c.freelancer_id,
        c.created_at,
        c.updated_at,

        p.title AS project_title,
        p.status AS project_status,

        client.fullname AS client_name,
        client.email AS client_email,

        freelancer.fullname AS freelancer_name,
        freelancer.email AS freelancer_email

      FROM conversations c

      JOIN projects p
        ON c.project_id = p.id

      JOIN users client
        ON c.client_id = client.id

      JOIN users freelancer
        ON c.freelancer_id = freelancer.id

      WHERE c.id = $1
      `,
      [id]
    );

    if (conversationResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found.",
      });
    }

    const conversation = conversationResult.rows[0];

    // ============================================
    // CHECK USER ACCESS
    // ============================================

    if (
      Number(conversation.client_id) !== Number(user_id) &&
      Number(conversation.freelancer_id) !== Number(user_id)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to access this conversation.",
      });
    }

    // ============================================
    // GET MESSAGES
    // ============================================

    const messagesResult = await pool.query(
      `
      SELECT
        m.id,
        m.conversation_id,
        m.sender_id,
        m.message,
        m.created_at,

        u.fullname AS sender_name,
        u.role AS sender_role

      FROM messages m

      JOIN users u
        ON m.sender_id = u.id

      WHERE m.conversation_id = $1

      ORDER BY m.created_at ASC
      `,
      [id]
    );

    return res.status(200).json({
      success: true,
      conversation,
      messages: messagesResult.rows,
    });
  } catch (error) {
    console.error(
      "GET CONVERSATION ERROR:",
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
// SEND MESSAGE
// ============================================

const sendMessage = async (req, res) => {
  try {
    const { conversation_id, sender_id, message } = req.body;

    // ============================================
    // VALIDATION
    // ============================================

    if (!conversation_id || !sender_id || !message) {
      return res.status(400).json({
        success: false,
        message:
          "Conversation ID, sender ID and message are required.",
      });
    }

    const cleanMessage = message.trim();

    if (!cleanMessage) {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty.",
      });
    }

    // ============================================
    // CHECK CONVERSATION
    // ============================================

    const conversationResult = await pool.query(
      `
      SELECT
        id,
        project_id,
        client_id,
        freelancer_id
      FROM conversations
      WHERE id = $1
      `,
      [conversation_id]
    );

    if (conversationResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found.",
      });
    }

    const conversation = conversationResult.rows[0];

    // ============================================
    // CHECK USER ACCESS
    // ============================================

    if (
      Number(conversation.client_id) !== Number(sender_id) &&
      Number(conversation.freelancer_id) !== Number(sender_id)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to send messages in this conversation.",
      });
    }

    // ============================================
    // INSERT MESSAGE
    // ============================================

    const messageResult = await pool.query(
      `
      INSERT INTO messages (
        conversation_id,
        sender_id,
        message
      )
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [
        conversation_id,
        sender_id,
        cleanMessage,
      ]
    );

    // ============================================
    // UPDATE CONVERSATION TIME
    // ============================================

    await pool.query(
      `
      UPDATE conversations
      SET updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      `,
      [conversation_id]
    );

    return res.status(201).json({
      success: true,
      message: "Message sent successfully.",
      data: messageResult.rows[0],
    });
  } catch (error) {
    console.error(
      "SEND MESSAGE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

module.exports = {
  getOrCreateConversation,
  getUserConversations,
  getConversationById,
  sendMessage,
};