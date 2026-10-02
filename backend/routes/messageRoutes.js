const express = require("express");

const router = express.Router();

const {
  createOrGetConversation,
  getUserConversations,
  getConversationById,
  getMessages,
  sendMessage,
  markMessageAsRead,
} = require("../controllers/messageController");

// ============================================================
// CREATE OR GET CONVERSATION
// ============================================================

router.post(
  "/conversations",
  createOrGetConversation
);

// ============================================================
// GET USER CONVERSATIONS
// ============================================================

router.get(
  "/conversations/user/:user_id",
  getUserConversations
);

// ============================================================
// GET SINGLE CONVERSATION
// ============================================================

router.get(
  "/conversations/:id",
  getConversationById
);

// ============================================================
// GET MESSAGES
// ============================================================

router.get(
  "/conversations/:conversation_id/messages",
  getMessages
);

// ============================================================
// SEND MESSAGE
// ============================================================

router.post(
  "/messages",
  sendMessage
);

// ============================================================
// MARK SINGLE MESSAGE AS READ
// ============================================================

router.put(
  "/messages/:id/read",
  markMessageAsRead
);

module.exports = router;