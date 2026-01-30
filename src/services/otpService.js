const pool = require('../config/db');
const { generateOTP } = require('../utils/otpGenerator');
const { generateToken } = require('../utils/jwtHelper');

/**
 * Create or get user by phone number
 * If user doesn't exist, create a new user record
 * @param {string} phone - User's phone number
 * @returns {Promise<Object>} User object
 */
async function ensureUserExists(phone) {
  const client = await pool.connect();
  
  try {
    // Check if user exists
    const checkUserQuery = 'SELECT * FROM users WHERE phone = $1';
    const userResult = await client.query(checkUserQuery, [phone]);
    
    if (userResult.rows.length > 0) {
      return userResult.rows[0];
    }
    
    // Create new user if doesn't exist
    const createUserQuery = `
      INSERT INTO users (phone, is_active)
      VALUES ($1, $2)
      RETURNING *
    `;
    const newUserResult = await client.query(createUserQuery, [phone, false]);
    
    return newUserResult.rows[0];
  } finally {
    client.release();
  }
}

/**
 * Store OTP record in database
 * @param {string} phone - User's phone number
 * @param {string} otpCode - Generated OTP code
 * @param {string} purpose - Purpose of OTP (login, family_approval, etc.)
 * @returns {Promise<Object>} Created OTP record
 */
async function storeOTP(phone, otpCode, purpose = 'login') {
  const client = await pool.connect();
  
  try {
    // Calculate expiry time (5 minutes from now)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    
    const insertQuery = `
      INSERT INTO otp_records (phone, otp_code, purpose, is_used, expires_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const result = await client.query(insertQuery, [
      phone,
      otpCode,
      purpose,
      false,
      expiresAt
    ]);
    
    return result.rows[0];
  } finally {
    client.release();
  }
}

/**
 * Generate and send OTP for login
 * @param {string} phone - User's phone number
 * @returns {Promise<Object>} Result object with success status
 */
async function generateLoginOTP(phone) {
  // Ensure user exists (create if new)
  await ensureUserExists(phone);
  
  // Generate 6-digit OTP
  const otpCode = generateOTP();
  
  // Store OTP in database
  await storeOTP(phone, otpCode, 'login');
  
  // Log OTP to console (instead of sending SMS in MVP)
  console.log(`\n📱 OTP for ${phone}: ${otpCode}`);
  console.log(`⏰ Expires in 5 minutes\n`);
  
  return {
    success: true,
    message: 'OTP generated successfully'
  };
}

/**
 * Verify OTP for login
 * @param {string} phone - User's phone number
 * @param {string} otpCode - OTP code to verify
 * @returns {Promise<Object>} Result with token if successful
 */
async function verifyLoginOTP(phone, otpCode) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Fetch the latest OTP record for this phone
    const fetchOTPQuery = `
      SELECT * FROM otp_records
      WHERE phone = $1
        AND purpose = $2
        AND is_used = $3
      ORDER BY expires_at DESC
      LIMIT 1
    `;
    
    const otpResult = await client.query(fetchOTPQuery, [phone, 'login', false]);
    
    // Check if OTP exists
    if (otpResult.rows.length === 0) {
      throw new Error('Invalid OTP or OTP has already been used');
    }
    
    const otpRecord = otpResult.rows[0];
    
    // Check if OTP matches
    if (otpRecord.otp_code !== otpCode) {
      throw new Error('Invalid OTP code');
    }
    
    // Check if OTP is expired
    const currentTime = new Date();
    const expiryTime = new Date(otpRecord.expires_at);
    
    if (currentTime > expiryTime) {
      throw new Error('OTP has expired');
    }
    
    // Mark OTP as used
    const updateOTPQuery = `
      UPDATE otp_records
      SET is_used = $1
      WHERE phone = $2 AND otp_code = $3 AND is_used = $4
    `;
    await client.query(updateOTPQuery, [true, phone, otpCode, false]);
    
    // Get user and mark as active
    const updateUserQuery = `
      UPDATE users
      SET is_active = $1
      WHERE phone = $2
      RETURNING *
    `;
    const userResult = await client.query(updateUserQuery, [true, phone]);
    
    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }
    
    const user = userResult.rows[0];
    
    // Generate JWT token
    const token = generateToken(user);
    
    await client.query('COMMIT');
    
    return {
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        phone: user.phone,
        is_active: user.is_active
      }
    };
    
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  generateLoginOTP,
  verifyLoginOTP,
  ensureUserExists,
  storeOTP
};
