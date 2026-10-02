const pool = require("../config/db");

// ============================================================
// CREATE OR GET CONVERSATION
// ============================================================

const createOrGetConversation = async (req, res) => {
  try {
    const { project_id, user_id } = req.body;

    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

    if (!project_id || !user_id) {
      return res.status(400).json({
        success: false,
        message: "Project ID and User ID are required.",
      });
    }

    const projectId = Number(project_id);
    const loggedInUserId = Number(user_id);

    if (
      Number.isNaN(projectId) ||
      Number.isNaN(loggedInUserId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Project ID and User ID must be valid numbers.",
      });
    }

    // ========================================================
    // GET PROJECT
    // ========================================================

    const projectResult = await pool.query(
      `
      SELECT
        p.id,
        p.title,
        p.client_id AS client_profile_id,
        p.freelancer_id,

        cp.user_id AS client_user_id,

        client_user.fullname AS client_name,
        client_user.email AS client_email,

        freelancer_user.fullname AS freelancer_name,
        freelancer_user.email AS freelancer_email

      FROM projects p

      JOIN client_profiles cp
        ON p.client_id = cp.id

      JOIN users client_user
        ON cp.user_id = client_user.id

      LEFT JOIN users freelancer_user
        ON p.freelancer_id = freelancer_user.id

      WHERE p.id = $1
      `,
      [projectId]
    );

    // ========================================================
    // PROJECT NOT FOUND
    // ========================================================

    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    const project = projectResult.rows[0];

    // ========================================================
    // GET USER IDS
    // ========================================================

    const clientUserId = Number(project.client_user_id);

    const freelancerUserId = project.freelancer_id
      ? Number(project.freelancer_id)
      : null;

    // ========================================================
    // CHECK FREELANCER
    // ========================================================

    if (!freelancerUserId) {
      return res.status(400).json({
        success: false,
        message:
          "This project does not have a freelancer assigned yet.",
      });
    }

    // ========================================================
    // CHECK USER ACCESS
    // ========================================================

    if (
      loggedInUserId !== clientUserId &&
      loggedInUserId !== freelancerUserId
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not associated with this project.",
      });
    }

    // ========================================================
    // CHECK EXISTING CONVERSATION
    // ========================================================

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
      LIMIT 1
      `,
      [projectId]
    );

    // ========================================================
    // RETURN EXISTING CONVERSATION
    // ========================================================

    if (existingConversation.rows.length > 0) {
      return res.status(200).json({
        success: true,
        message: "Conversation already exists.",
        conversation: existingConversation.rows[0],
      });
    }

    // ========================================================
    // CREATE NEW CONVERSATION
    // ========================================================

    const newConversation = await pool.query(
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
        projectId,
        clientUserId,
        freelancerUserId,
      ]
    );

    // ========================================================
    // SUCCESS
    // ========================================================

    return res.status(201).json({
      success: true,
      message:
        "Conversation started successfully.",

      conversation: {
        ...newConversation.rows[0],

        project_title: project.title,

        client_name: project.client_name,
        client_email: project.client_email,

        freelancer_name:
          project.freelancer_name,
        freelancer_email:
          project.freelancer_email,
      },
    });
  } catch (error) {
    console.error(
      "CREATE OR GET CONVERSATION ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ============================================================
// GET USER CONVERSATIONS
// ============================================================

const getUserConversations = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    const loggedInUserId = Number(user_id);

    if (Number.isNaN(loggedInUserId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid User ID.",
      });
    }

    const result = await pool.query(
      `
      SELECT
        c.id,
        c.project_id,
        c.client_id,
        c.freelancer_id,

        p.title AS project_title,

        CASE
          WHEN c.client_id = $1
          THEN c.freelancer_id
          ELSE c.client_id
        END AS other_user_id,

        c.created_at,
        c.updated_at

      FROM conversations c

      JOIN projects p
        ON c.project_id = p.id

      WHERE
        c.client_id = $1
        OR c.freelancer_id = $1

      ORDER BY
        c.updated_at DESC,
        c.id DESC
      `,
      [loggedInUserId]
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

// ============================================================
// GET SINGLE CONVERSATION
// ============================================================

const getConversationById = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.query;

    if (!id || !user_id) {
      return res.status(400).json({
        success: false,
        message:
          "Conversation ID and User ID are required.",
      });
    }

    const conversationId = Number(id);
    const loggedInUserId = Number(user_id);

    if (
      Number.isNaN(conversationId) ||
      Number.isNaN(loggedInUserId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Conversation ID and User ID must be valid numbers.",
      });
    }

    // ========================================================
    // GET CONVERSATION
    // ========================================================

    const result = await pool.query(
      `
      SELECT
        c.id,
        c.project_id,
        c.client_id,
        c.freelancer_id,

        p.title AS project_title,

        client_user.id AS client_user_id,
        client_user.fullname AS client_name,
        client_user.email AS client_email,

        freelancer_user.id AS freelancer_user_id,
        freelancer_user.fullname AS freelancer_name,
        freelancer_user.email AS freelancer_email,

        c.created_at,
        c.updated_at

      FROM conversations c

      JOIN projects p
        ON c.project_id = p.id

      JOIN users client_user
        ON c.client_id = client_user.id

      JOIN users freelancer_user
        ON c.freelancer_id = freelancer_user.id

      WHERE
        c.id = $1
        AND (
          c.client_id = $2
          OR c.freelancer_id = $2
        )
      `,
      [
        conversationId,
        loggedInUserId,
      ]
    );

    // ========================================================
    // NOT FOUND
    // ========================================================

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Conversation not found or you are not associated with this project.",
      });
    }

    const conversation = result.rows[0];

    // ========================================================
    // SUCCESS
    // ========================================================

    return res.status(200).json({
      success: true,
      conversation,
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

// ============================================================
// GET MESSAGES
// ============================================================

const getMessages = async (req, res) => {
  try {
    const { conversation_id } = req.params;
    const { user_id } = req.query;

    if (!conversation_id || !user_id) {
      return res.status(400).json({
        success: false,
        message:
          "Conversation ID and User ID are required.",
      });
    }

    const conversationId = Number(conversation_id);
    const loggedInUserId = Number(user_id);

    if (
      Number.isNaN(conversationId) ||
      Number.isNaN(loggedInUserId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Conversation ID and User ID must be valid numbers.",
      });
    }

    // ========================================================
    // CHECK CONVERSATION ACCESS
    // ========================================================

    const conversationResult = await pool.query(
      `
      SELECT
        id,
        client_id,
        freelancer_id
      FROM conversations
      WHERE
        id = $1
        AND (
          client_id = $2
          OR freelancer_id = $2
        )
      `,
      [
        conversationId,
        loggedInUserId,
      ]
    );

    if (conversationResult.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message:
          "You are not associated with this conversation.",
      });
    }

    // ========================================================
    // GET MESSAGES
    // ========================================================
    //
    // IMPORTANT:
    //
    // We DO NOT automatically mark messages as read here.
    //
    // Individual messages will be marked as read using:
    //
    // PUT /api/messages/messages/:id/read
    //
    // ========================================================

    const result = await pool.query(
      `
      SELECT
        m.id,
        m.conversation_id,
        m.sender_id,
        m.receiver_id,
        m.message,
        m.is_read,
        m.created_at,

        u.fullname AS sender_name

      FROM messages m

      JOIN users u
        ON m.sender_id = u.id

      WHERE
        m.conversation_id = $1

      ORDER BY
        m.created_at ASC,
        m.id ASC
      `,
      [conversationId]
    );

    // ========================================================
    // SUCCESS
    // ========================================================

    return res.status(200).json({
      success: true,
      messages: result.rows,
    });
  } catch (error) {
    console.error(
      "GET MESSAGES ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ============================================================
// SEND MESSAGE
// ============================================================

const sendMessage = async (req, res) => {
  try {
    const {
      conversation_id,
      sender_id,
      message,
    } = req.body;

    // ========================================================
    // VALIDATION
    // ========================================================

    if (
      !conversation_id ||
      !sender_id ||
      !message ||
      !message.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty.",
      });
    }

    const conversationId = Number(conversation_id);
    const senderId = Number(sender_id);

    if (
      Number.isNaN(conversationId) ||
      Number.isNaN(senderId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Conversation ID and Sender ID must be valid numbers.",
      });
    }

    // ========================================================
    // GET CONVERSATION
    // ========================================================

    const conversationResult = await pool.query(
      `
      SELECT
        id,
        client_id,
        freelancer_id
      FROM conversations
      WHERE id = $1
      `,
      [conversationId]
    );

    if (conversationResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found.",
      });
    }

    const conversation =
      conversationResult.rows[0];

    const clientId = Number(
      conversation.client_id
    );

    const freelancerId = Number(
      conversation.freelancer_id
    );

    // ========================================================
    // CHECK SENDER
    // ========================================================

    if (
      senderId !== clientId &&
      senderId !== freelancerId
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not associated with this conversation.",
      });
    }

    // ========================================================
    // DETERMINE RECEIVER
    // ========================================================

    const receiverId =
      senderId === clientId
        ? freelancerId
        : clientId;

    // ========================================================
    // INSERT MESSAGE
    // ========================================================

    const result = await pool.query(
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
        conversationId,
        senderId,
        receiverId,
        message.trim(),
      ]
    );

    // ========================================================
    // UPDATE CONVERSATION
    // ========================================================

    await pool.query(
      `
      UPDATE conversations
      SET updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      `,
      [conversationId]
    );

    // ========================================================
    // SUCCESS
    // ========================================================

    return res.status(201).json({
      success: true,
      message: "Message sent successfully.",
      data: result.rows[0],
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

// ============================================================
// MARK MESSAGE AS READ
// ============================================================

const markMessageAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    // ========================================================
    // VALIDATION
    // ========================================================

    if (!id || !user_id) {
      return res.status(400).json({
        success: false,
        message:
          "Message ID and User ID are required.",
      });
    }

    const messageId = Number(id);
    const userId = Number(user_id);

    if (
      Number.isNaN(messageId) ||
      Number.isNaN(userId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Message ID and User ID must be valid numbers.",
      });
    }

    // ========================================================
    // CHECK MESSAGE
    // ========================================================

    const messageResult = await pool.query(
      `
      SELECT
        id,
        conversation_id,
        sender_id,
        receiver_id,
        message,
        is_read,
        created_at
      FROM messages
      WHERE id = $1
      `,
      [messageId]
    );

    // ========================================================
    // MESSAGE NOT FOUND
    // ========================================================

    if (messageResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Message not found.",
      });
    }

    const existingMessage =
      messageResult.rows[0];

    // ========================================================
    // CHECK RECEIVER
    // ========================================================
    //
    // Only the person who received the message
    // can mark it as read.
    //
    // ========================================================

    if (
      Number(existingMessage.receiver_id) !==
      userId
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You can only mark messages sent to you as read.",
      });
    }

    // ========================================================
    // ALREADY READ
    // ========================================================

    if (existingMessage.is_read) {
      return res.status(200).json({
        success: true,
        message: "Message is already marked as read.",
        messageData: existingMessage,
      });
    }

    // ========================================================
    // MARK AS READ
    // ========================================================

    const result = await pool.query(
      `
      UPDATE messages
      SET is_read = TRUE
      WHERE
        id = $1
        AND receiver_id = $2
      RETURNING *
      `,
      [
        messageId,
        userId,
      ]
    );

    // ========================================================
    // SUCCESS
    // ========================================================

    return res.status(200).json({
      success: true,
      message: "Message marked as read.",
      messageData: result.rows[0],
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

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  createOrGetConversation,
  getUserConversations,
  getConversationById,
  getMessages,
  sendMessage,
  markMessageAsRead,
};