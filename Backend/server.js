const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const app = require('./app');
const { verifyEmailConnection } = require('./services/emailService');
const { initializeAITables } = require('./config/aiInitialize');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Verify email service on startup
    console.log('📧 Checking email service...');
    await verifyEmailConnection();

    // Initialize AI Chat tables
    console.log('🤖 Initializing AI Chat database tables...');
    await initializeAITables();
    
    app.listen(PORT, () => {
      console.log(`\n✅ Healthcare API server running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
      console.log(`📍 AI Chat: POST http://localhost:${PORT}/api/ai/chat`);
      console.log(`🤖 AI Routes available at http://localhost:${PORT}/api/ai/*\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
