const express = require("express");
const router = express.Router();

const {
  getOrCreateConversation,
  getUserConversations,
  getConversationById,
  getConversationMessages,
  sendMessage,
  markMessageAsRead,
} = require("../controllers/messageController");

// ============================================
// CREATE / GET CONVERSATION
// ============================================

router.post("/conversations", getOrCreateConversation);

// ============================================
// GET USER CONVERSATIONS
// ============================================

router.get(
  "/conversations/user/:user_id",
  getUserConversations
);

// ============================================
// GET SINGLE CONVERSATION
// ============================================

router.get(
  "/conversations/:id",
  getConversationById
);

// ============================================
// GET MESSAGE HISTORY
// ============================================

router.get(
  "/conversations/:conversation_id/messages",
  getConversationMessages
);

// ============================================
// SEND MESSAGE
// ============================================

router.post("/messages", sendMessage);

// ============================================
// MARK MESSAGE AS READ
// ============================================

router.put(
  "/messages/:id/read",
  markMessageAsRead
);

module.exports = router;