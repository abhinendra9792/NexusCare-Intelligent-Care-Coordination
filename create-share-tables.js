const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

async function createShareTables() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Creating share links tables...');
    
    // Create report_shares table
    await client.query(`
      CREATE TABLE IF NOT EXISTS report_shares (
        share_id SERIAL PRIMARY KEY,
        report_id UUID NOT NULL,
        shared_by UUID NOT NULL,
        token VARCHAR(64) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        revoked_at TIMESTAMP NULL,
        FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
        FOREIGN KEY (shared_by) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ report_shares table created');

    // Create share_access_logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS share_access_logs (
        access_id SERIAL PRIMARY KEY,
        share_id INTEGER NOT NULL,
        accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ip_address VARCHAR(45),
        FOREIGN KEY (share_id) REFERENCES report_shares(share_id) ON DELETE CASCADE
      )
    `);
    console.log('✅ share_access_logs table created');

    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_report_shares_token ON report_shares(token)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_report_shares_report_id ON report_shares(report_id)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_share_access_logs_share_id ON share_access_logs(share_id)
    `);
    console.log('✅ Indexes created');

    console.log('\n🎉 Share links tables created successfully!');
    console.log('\nYou can now:');
    console.log('1. Generate share links for reports');
    console.log('2. View who accessed your shared reports');
    console.log('3. Revoke links anytime (even before expiry)');
    
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

createShareTables();
