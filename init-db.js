const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

async function initializeDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Initializing Healthcare Vault Database...\n');
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        phone VARCHAR(20),
        date_of_birth DATE,
        gender VARCHAR(10),
        blood_group VARCHAR(10),
        allergies TEXT,
        medical_conditions TEXT,
        emergency_contact_name VARCHAR(100),
        emergency_contact_phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT true
      )
    `);
    console.log('✅ users table created');

    // Create labs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS labs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        postal_code VARCHAR(20),
        license_number VARCHAR(100) UNIQUE,
        is_verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT true
      )
    `);
    console.log('✅ labs table created');

    // Create otp_logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS otp_logs (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        otp VARCHAR(6) NOT NULL,
        purpose VARCHAR(50), -- 'signup', 'login', 'password_reset'
        expires_at TIMESTAMP NOT NULL,
        is_verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ otp_logs table created');

    // Create reports table
    await client.query(`
      CREATE TABLE IF NOT EXISTS reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id UUID NOT NULL,
        lab_id UUID NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_size INTEGER,
        report_type VARCHAR(100),
        test_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (lab_id) REFERENCES labs(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ reports table created');

    // Create access_logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS access_logs (
        id SERIAL PRIMARY KEY,
        report_id UUID NOT NULL,
        accessed_by UUID NOT NULL,
        accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ip_address VARCHAR(45),
        FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
        FOREIGN KEY (accessed_by) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ access_logs table created');

    // Create family_members table
    await client.query(`
      CREATE TABLE IF NOT EXISTS family_members (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        member_name VARCHAR(100) NOT NULL,
        relationship VARCHAR(50),
        date_of_birth DATE,
        blood_group VARCHAR(10),
        medical_conditions TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ family_members table created');

    // Create report_shares table (for sharing reports with others)
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

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_labs_email ON labs(email);
      CREATE INDEX IF NOT EXISTS idx_reports_patient_id ON reports(patient_id);
      CREATE INDEX IF NOT EXISTS idx_reports_lab_id ON reports(lab_id);
      CREATE INDEX IF NOT EXISTS idx_access_logs_report_id ON access_logs(report_id);
      CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON family_members(user_id);
      CREATE INDEX IF NOT EXISTS idx_report_shares_token ON report_shares(token);
      CREATE INDEX IF NOT EXISTS idx_report_shares_report_id ON report_shares(report_id);
      CREATE INDEX IF NOT EXISTS idx_share_access_logs_share_id ON share_access_logs(share_id);
      CREATE INDEX IF NOT EXISTS idx_otp_logs_email ON otp_logs(email);
    `);
    console.log('✅ Indexes created');

    console.log('\n🎉 Database initialized successfully!');
    console.log('\nTables created:');
    console.log('  • users - Patient information');
    console.log('  • labs - Laboratory information');
    console.log('  • otp_logs - OTP verification logs');
    console.log('  • reports - Medical reports');
    console.log('  • access_logs - Report access tracking');
    console.log('  • family_members - Family health records');
    console.log('  • report_shares - Shared report links');
    console.log('  • share_access_logs - Shared report access tracking');
    
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

initializeDatabase();
