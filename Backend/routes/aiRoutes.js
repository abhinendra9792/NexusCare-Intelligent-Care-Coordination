const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const {
  sendMessage,
  getHistory,
  deleteHistory,
  exportChat,
  getUserInfo
} = require('../controllers/aiController');

/**
 * POST /api/ai/chat
 * Send message and get AI response from Gemini
 * Protected route - requires valid JWT token
 */
router.post('/chat', authenticate, sendMessage);

/**
 * GET /api/ai/history
 * Get chat history for authenticated user
 * Protected route - requires valid JWT token
 * Query params: limit (default: 50)
 */
router.get('/history', authenticate, getHistory);

/**
 * DELETE /api/ai/history
 * Clear all chat history for authenticated user
 * Protected route - requires valid JWT token
 */
router.delete('/history', authenticate, deleteHistory);

/**
 * GET /api/ai/export
 * Export conversation as JSON file
 * Protected route - requires valid JWT token
 */
router.get('/export', authenticate, exportChat);

/**
 * GET /api/ai/profile
 * Get user profile for greeting and personalization
 * Protected route - requires valid JWT token
 */
router.get('/profile', authenticate, getUserInfo);

module.exports = router;
