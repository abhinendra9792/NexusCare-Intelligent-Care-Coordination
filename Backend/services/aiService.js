const { GoogleGenerativeAI } = require("@google/generative-ai");
const pool = require('../config/db');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Send message to Gemini AI and get health-related response
 * @param {string} userMessage - User's message
 * @param {string} userId - User ID for chat history
 * @returns {Promise<string>} - AI response
 */
async function getChatResponse(userMessage, userId) {
  try {
    // Get user info for context
    const userQuery = 'SELECT first_name, last_name, email FROM users WHERE id = $1';
    const userResult = await pool.query(userQuery, [userId]);
    const user = userResult.rows[0];

    // Get recent chat history for context (last 5 messages)
    const historyQuery = `
      SELECT sender, message_text 
      FROM chat_messages 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT 10
    `;
    const historyResult = await pool.query(historyQuery, [userId]);
    const chatHistory = historyResult.rows.reverse();

    // Build conversation context
    let conversationContext = `You are a helpful AI Health Assistant named HealthBot. You are helping ${user.first_name} with health-related questions.`;
    conversationContext += '\n\nRecent conversation history:';
    
    chatHistory.forEach(msg => {
      if (msg.sender === 'user') {
        conversationContext += `\nUser: ${msg.message_text}`;
      } else {
        conversationContext += `\nAssistant: ${msg.message_text}`;
      }
    });

    conversationContext += '\n\nImportant guidelines:';
    conversationContext += '\n- Always provide health information with a disclaimer to consult doctors';
    conversationContext += '\n- Be supportive and encouraging';
    conversationContext += '\n- Ask follow-up questions when needed';
    conversationContext += '\n- Keep responses concise and easy to understand';
    conversationContext += '\n- If asked about serious symptoms, strongly recommend seeing a doctor';

    // Get Gemini response with retry logic for rate limits
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }, { apiVersion: "v1beta" });
    const chat = model.startChat({
      history: chatHistory.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.message_text }]
      })),
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
      },
    });

    let response;
    const maxRetries = 2;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await chat.sendMessage(userMessage);
        response = result.response.text();
        break; // Success, exit retry loop
      } catch (apiError) {
        const isRateLimit = apiError.message && (apiError.message.includes('429') || apiError.message.includes('Too Many Requests') || apiError.message.includes('quota'));
        if (isRateLimit && attempt < maxRetries) {
          console.log(`⏳ Rate limited, retrying in 30 seconds... (attempt ${attempt + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 30000));
        } else if (isRateLimit) {
          throw new Error('The AI service is temporarily busy due to rate limits. Please wait a minute and try again.');
        } else {
          throw apiError;
        }
      }
    }

    // Save user message to database
    const userMessageQuery = `
      INSERT INTO chat_messages (user_id, sender, message_text, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING *
    `;
    await pool.query(userMessageQuery, [userId, 'user', userMessage]);

    // Save AI response to database
    const aiMessageQuery = `
      INSERT INTO chat_messages (user_id, sender, message_text, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING *
    `;
    await pool.query(aiMessageQuery, [userId, 'assistant', response]);

    return {
      success: true,
      response: response,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error in getChatResponse:', error);
    throw new Error('Failed to get AI response: ' + error.message);
  }
}

/**
 * Get chat history for a user
 * @param {string} userId - User ID
 * @param {number} limit - Number of messages to retrieve (default: 50)
 * @returns {Promise<Array>} - Array of chat messages
 */
async function getChatHistory(userId, limit = 50) {
  try {
    const query = `
      SELECT 
        message_id,
        user_id,
        sender,
        message_text,
        created_at
      FROM chat_messages
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;
    
    const result = await pool.query(query, [userId, limit]);
    
    return {
      success: true,
      messages: result.rows.reverse(), // Return in chronological order
      count: result.rows.length
    };

  } catch (error) {
    console.error('Error in getChatHistory:', error);
    throw new Error('Failed to retrieve chat history: ' + error.message);
  }
}

/**
 * Clear chat history for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Deletion result
 */
async function clearChatHistory(userId) {
  try {
    const query = 'DELETE FROM chat_messages WHERE user_id = $1 RETURNING *';
    const result = await pool.query(query, [userId]);

    return {
      success: true,
      deletedMessages: result.rowCount,
      message: `Cleared ${result.rowCount} messages from history`
    };

  } catch (error) {
    console.error('Error in clearChatHistory:', error);
    throw new Error('Failed to clear chat history: ' + error.message);
  }
}

/**
 * Export chat conversation
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Exported conversation data
 */
async function exportConversation(userId) {
  try {
    const query = `
      SELECT 
        sender,
        message_text,
        created_at
      FROM chat_messages
      WHERE user_id = $1
      ORDER BY created_at ASC
    `;
    
    const result = await pool.query(query, [userId]);
    const timestamp = new Date().toISOString().split('T')[0];

    return {
      success: true,
      data: {
        exportDate: new Date().toISOString(),
        conversationCount: result.rows.length,
        messages: result.rows
      },
      filename: `healthcare-vault-chat-${timestamp}.json`
    };

  } catch (error) {
    console.error('Error in exportConversation:', error);
    throw new Error('Failed to export conversation: ' + error.message);
  }
}

/**
 * Get user profile for greeting
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - User profile information
 */
async function getUserProfile(userId) {
  try {
    const query = `
      SELECT 
        id,
        email,
        first_name,
        last_name,
        created_at
      FROM users
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [userId]);
    
    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    const user = result.rows[0];

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        fullName: `${user.first_name} ${user.last_name}`,
        joinDate: user.created_at
      }
    };

  } catch (error) {
    console.error('Error in getUserProfile:', error);
    throw new Error('Failed to get user profile: ' + error.message);
  }
}

module.exports = {
  getChatResponse,
  getChatHistory,
  clearChatHistory,
  exportConversation,
  getUserProfile
};
