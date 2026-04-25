const pool = require('./db');

/**
 * Initialize database tables for AI Chat functionality
 */
async function initializeAITables() {
  try {
    // Create chat_messages table if it doesn't exist
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS chat_messages (
        message_id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        sender VARCHAR(20) NOT NULL CHECK (sender IN ('user', 'assistant')),
        message_text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create index for faster queries
      CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
      CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
      CREATE INDEX IF NOT EXISTS idx_chat_messages_user_created ON chat_messages(user_id, created_at);
    `;

    await pool.query(createTableQuery);
    console.log('✅ AI Chat tables initialized successfully');
    return true;

  } catch (error) {
    console.error('❌ Error initializing AI Chat tables:', error);
    return false;
  }
}

/**
 * Check if chat_messages table exists
 */
async function chatMessagesTableExists() {
  try {
    const query = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'chat_messages'
      );
    `;
    const result = await pool.query(query);
    return result.rows[0].exists;

  } catch (error) {
    console.error('Error checking if chat_messages table exists:', error);
    return false;
  }
}

module.exports = {
  initializeAITables,
  chatMessagesTableExists
};
