const pool = require("../config/db");

// ============================================
// CREATE / GET CONVERSATION
// ============================================

const getOrCreateConversation = async (req, res) => {
  try {
    const {
      project_id,
      client_id,
      freelancer_id,
    } = req.body;

    // ============================================
    // REQUIRED FIELDS
    // ============================================

    if (!project_id || !client_id || !freelancer_id) {
      return res.status(400).json({
        success: false,
        message:
          "Project ID, client ID, and freelancer ID are required.",
      });
    }

    // ============================================
    // CHECK PROJECT
    // ============================================

    const projectResult = await pool.query(
      `
      SELECT
        id,
        client_id,
        freelancer_id,
        status
      FROM projects
      WHERE id = $1
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

    if (Number(project.client_id) !== Number(client_id)) {
      return res.status(403).json({
        success: false,
        message: "Client is not associated with this project.",
      });
    }

    // ============================================
    // VERIFY FREELANCER
    // ============================================

    if (
      project.freelancer_id === null ||
      Number(project.freelancer_id) !== Number(freelancer_id)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Freelancer is not assigned to this project.",
      });
    }

    // ============================================
    // FIND EXISTING CONVERSATION
    // ============================================

    const existingConversation = await pool.query(
      `
      SELECT *
      FROM conversations
      WHERE project_id = $1
      `,
      [project_id]
    );

    if (existingConversation.rows.length > 0) {
      return res.status(200).json({
        success: true,
        message: "Conversation retrieved successfully.",
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
        c.*,
        p.title AS project_title,
        CASE
          WHEN c.client_id = $1 THEN c.freelancer_id
          ELSE c.client_id
        END AS other_user_id
      FROM conversations c
      JOIN projects p
        ON c.project_id = p.id
      WHERE c.client_id = $1
         OR c.freelancer_id = $1
      ORDER BY c.updated_at DESC, c.id DESC
      `,
      [user_id]
    );

    return res.status(200).json({
      success: true,
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
// GET CONVERSATION
// ============================================

const getConversationById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        c.*,
        p.title AS project_title
      FROM conversations c
      JOIN projects p
        ON c.project_id = p.id
      WHERE c.id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found.",
      });
    }

    return res.status(200).json({
      success: true,
      conversation: result.rows[0],
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
// GET MESSAGE HISTORY
// ============================================

const getConversationMessages = async (req, res) => {
  try {
    const { conversation_id } = req.params;

    if (!conversation_id) {
      return res.status(400).json({
        success: false,
        message: "Conversation ID is required.",
      });
    }

    const result = await pool.query(
      `
      SELECT
        m.*,
        u.fullname AS sender_name
      FROM messages m
      JOIN users u
        ON m.sender_id = u.id
      WHERE m.conversation_id = $1
      ORDER BY m.created_at ASC, m.id ASC
      `,
      [conversation_id]
    );

    return res.status(200).json({
      success: true,
      messages: result.rows,
    });
  } catch (error) {
    console.error(
      "GET CONVERSATION MESSAGES ERROR:",
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
    const {
      conversation_id,
      sender_id,
      receiver_id,
      message,
    } = req.body;

    // ============================================
    // REQUIRED FIELDS
    // ============================================

    if (
      !conversation_id ||
      !sender_id ||
      !receiver_id ||
      !message ||
      !message.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Conversation ID, sender, receiver, and message are required.",
      });
    }

    // ============================================
    // CHECK CONVERSATION
    // ============================================

    const conversationResult = await pool.query(
      `
      SELECT
        c.*,
        p.title AS project_title
      FROM conversations c
      JOIN projects p
        ON c.project_id = p.id
      WHERE c.id = $1
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
    // VERIFY SENDER
    // ============================================

    const senderIsParticipant =
      Number(sender_id) === Number(conversation.client_id) ||
      Number(sender_id) === Number(conversation.freelancer_id);

    if (!senderIsParticipant) {
      return res.status(403).json({
        success: false,
        message:
          "Sender is not a participant in this conversation.",
      });
    }

    // ============================================
    // VERIFY RECEIVER
    // ============================================

    const receiverIsParticipant =
      Number(receiver_id) === Number(conversation.client_id) ||
      Number(receiver_id) === Number(conversation.freelancer_id);

    if (!receiverIsParticipant) {
      return res.status(403).json({
        success: false,
        message:
          "Receiver is not a participant in this conversation.",
      });
    }

    if (Number(sender_id) === Number(receiver_id)) {
      return res.status(400).json({
        success: false,
        message:
          "Sender and receiver must be different users.",
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
        receiver_id,
        message
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [
        conversation_id,
        sender_id,
        receiver_id,
        message.trim(),
      ]
    );

    const newMessage = messageResult.rows[0];

    // ============================================
    // UPDATE CONVERSATION
    // ============================================

    await pool.query(
      `
      UPDATE conversations
      SET updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      `,
      [conversation_id]
    );

    // ============================================
    // GET SENDER NAME
    // ============================================

    const senderResult = await pool.query(
      `
      SELECT fullname
      FROM users
      WHERE id = $1
      `,
      [sender_id]
    );

    const senderName =
      senderResult.rows[0]?.fullname || "A user";

    // ============================================
    // CREATE NOTIFICATION FOR RECEIVER
    // ============================================

    await pool.query(
      `
      INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        reference_id
      )
      VALUES ($1, $2, $3, $4, $5)
      `,
      [
        receiver_id,
        "new_message",
        "New Message",
        `${senderName} sent you a message about ${conversation.project_title}.`,
        conversation_id,
      ]
    );

    // ============================================
    // RESPONSE
    // ============================================

    return res.status(201).json({
      success: true,
      message: "Message sent successfully.",
      data: newMessage,
    });
  } catch (error) {
    console.error("SEND MESSAGE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ============================================
// MARK MESSAGE AS READ
// ============================================

const markMessageAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      UPDATE messages
      SET is_read = TRUE
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Message not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Message marked as read.",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(
      "MARK MESSAGE AS READ ERROR:",
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
  getOrCreateConversation,
  getUserConversations,
  getConversationById,
  getConversationMessages,
  sendMessage,
  markMessageAsRead,
};