const express = require("express");

const {
  getOrCreateConversation,
  getUserConversations,
  getConversationById,
  sendMessage,
} = require("../controllers/conversationController");

const router = express.Router();

// ============================================
// CREATE OR GET CONVERSATION
// ============================================

router.post(
  "/",
  getOrCreateConversation
);

// ============================================
// GET ALL USER CONVERSATIONS
// ============================================

router.get(
  "/user/:user_id",
  getUserConversations
);

// ============================================
// GET SINGLE CONVERSATION + MESSAGES
// ============================================

router.get(
  "/:id",
  getConversationById
);

// ============================================
// SEND MESSAGE
// ============================================

router.post(
  "/message",
  sendMessage
);

module.exports = router;