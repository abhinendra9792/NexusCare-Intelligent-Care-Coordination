const {
  getChatResponse,
  getChatHistory,
  clearChatHistory,
  exportConversation,
  getUserProfile
} = require('../services/aiService');

/**
 * POST /api/ai/chat
 * Send message and get AI response
 */
async function sendMessage(req, res) {
  try {
    const { message } = req.body;
    const userId = req.user.user_id;

    // Validate input
    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message cannot be empty'
      });
    }

    // Get AI response from Gemini
    const result = await getChatResponse(message, userId);

    return res.status(200).json({
      success: true,
      message: 'Message processed successfully',
      data: result
    });

  } catch (error) {
    console.error('Error in sendMessage:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to process message'
    });
  }
}

/**
 * GET /api/ai/history
 * Get chat history for user
 */
async function getHistory(req, res) {
  try {
    const userId = req.user.user_id;
    const limit = req.query.limit || 50;

    const result = await getChatHistory(userId, parseInt(limit));

    return res.status(200).json({
      success: true,
      message: 'Chat history retrieved successfully',
      data: result
    });

  } catch (error) {
    console.error('Error in getHistory:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve chat history'
    });
  }
}

/**
 * DELETE /api/ai/history
 * Clear chat history for user
 */
async function deleteHistory(req, res) {
  try {
    const userId = req.user.user_id;

    const result = await clearChatHistory(userId);

    return res.status(200).json({
      success: true,
      message: 'Chat history cleared successfully',
      data: result
    });

  } catch (error) {
    console.error('Error in deleteHistory:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to clear chat history'
    });
  }
}

/**
 * GET /api/ai/export
 * Export conversation as JSON
 */
async function exportChat(req, res) {
  try {
    const userId = req.user.user_id;

    const result = await exportConversation(userId);

    // Set headers for file download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);

    return res.status(200).json(result.data);

  } catch (error) {
    console.error('Error in exportChat:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to export conversation'
    });
  }
}

/**
 * GET /api/ai/profile
 * Get user profile for greeting and personalization
 */
async function getUserInfo(req, res) {
  try {
    const userId = req.user.user_id;

    const result = await getUserProfile(userId);

    return res.status(200).json({
      success: true,
      message: 'User profile retrieved successfully',
      data: result
    });

  } catch (error) {
    console.error('Error in getUserInfo:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve user profile'
    });
  }
}

module.exports = {
  sendMessage,
  getHistory,
  deleteHistory,
  exportChat,
  getUserInfo
};
