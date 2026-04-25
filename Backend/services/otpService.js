const pool = require('../config/db');
const { generateOTP } = require('../utils/otpGenerator');
const { generateToken } = require('../utils/jwtHelper');
const { sendOTPEmail } = require('./emailService');

/**
 * Create or get user by phone number and/or email
 * If user doesn't exist, create a new user record
 * @param {string} phone - User's phone number
 * @param {string} email - User's email address (optional)
 * @returns {Promise<Object>} User object
 */
async function ensureUserExists(phone, email = null) {
  const client = await pool.connect();
  
  try {
    // Check if user exists by phone or email
    let checkUserQuery;
    let userResult;
    
    if (email) {
      checkUserQuery = 'SELECT * FROM users WHERE phone = $1 OR email = $2';
      userResult = await client.query(checkUserQuery, [phone, email]);
    } else {
      checkUserQuery = 'SELECT * FROM users WHERE phone = $1';
      userResult = await client.query(checkUserQuery, [phone]);
    }
    
    if (userResult.rows.length > 0) {
      return userResult.rows[0];
    }
    
    // Create new user if doesn't exist
    const createUserQuery = `
      INSERT INTO users (phone, email, is_active)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const newUserResult = await client.query(createUserQuery, [phone, email, false]);
    
    return newUserResult.rows[0];
  } finally {
    client.release();
  }
}

/**
 * Store OTP record in database
 * @param {string} phone - User's phone number
 * @param {string} email - User's email address
 * @param {string} otpCode - Generated OTP code
 * @param {string} purpose - Purpose of OTP (login, signup, password_reset, etc.)
 * @returns {Promise<Object>} Created OTP record
 */
async function storeOTP(phone, email, otpCode, purpose = 'login') {
  const client = await pool.connect();
  
  try {
    // Calculate expiry time (5 minutes from now)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    
    const insertQuery = `
      INSERT INTO otp_logs (email, otp, purpose, expires_at, is_verified)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const result = await client.query(insertQuery, [
      email,
      otpCode,
      purpose,
      expiresAt,
      false
    ]);
    
    return result.rows[0];
  } finally {
    client.release();
  }
}

/**
 * Generate and send OTP for login
 * @param {string} phone - User's phone number
 * @param {string} email - User's email address
 * @param {string} purpose - Purpose of OTP
 * @returns {Promise<Object>} Result object with success status
 */
async function generateLoginOTP(phone, email, purpose = 'login') {
  try {
    // Validate email
    if (!email || !email.includes('@')) {
      throw new Error('Valid email address is required to receive OTP');
    }

    // Ensure user exists (create if new)
    await ensureUserExists(phone, email);
    
    // Generate 6-digit OTP
    const otpCode = generateOTP();
    
    // Store OTP in database
    await storeOTP(phone, email, otpCode, purpose);
    
    // Send OTP via email
    await sendOTPEmail(email, otpCode, purpose);
    
    return {
      success: true,
      message: 'OTP sent successfully to your email',
      email: email
    };
  } catch (error) {
    console.error('Error generating OTP:', error.message);
    throw error;
  }
}

/**
 * Verify OTP for login
 * @param {string} email - User's email address
 * @param {string} otpCode - OTP code to verify
 * @returns {Promise<Object>} Result with token if successful
 */
async function verifyLoginOTP(email, otpCode) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Fetch the latest OTP record for this email
    const fetchOTPQuery = `
      SELECT * FROM otp_logs
      WHERE email = $1
        AND otp = $2
        AND is_verified = $3
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    const otpResult = await client.query(fetchOTPQuery, [email, otpCode, false]);
    
    // Check if OTP exists
    if (otpResult.rows.length === 0) {
      throw new Error('Invalid OTP or OTP has already been used');
    }
    
    const otpRecord = otpResult.rows[0];
    
    // Check if OTP is expired
    const currentTime = new Date();
    const expiryTime = new Date(otpRecord.expires_at);
    
    if (currentTime > expiryTime) {
      throw new Error('OTP has expired. Please request a new one.');
    }
    
    // Mark OTP as verified
    const updateOTPQuery = `
      UPDATE otp_logs
      SET is_verified = $1
      WHERE id = $2
    `;
    await client.query(updateOTPQuery, [true, otpRecord.id]);
    
    // Get or create user
    let userQuery = `
      SELECT * FROM users WHERE email = $1
    `;
    let userResult = await client.query(userQuery, [email]);
    
    let user;
    if (userResult.rows.length === 0) {
      // Create new user if doesn't exist
      const createUserQuery = `
        INSERT INTO users (email, is_active)
        VALUES ($1, $2)
        RETURNING *
      `;
      userResult = await client.query(createUserQuery, [email, true]);
      user = userResult.rows[0];
    } else {
      user = userResult.rows[0];
      // Mark as active
      const activateUserQuery = `
        UPDATE users
        SET is_active = $1
        WHERE id = $2
        RETURNING *
      `;
      const activateResult = await client.query(activateUserQuery, [true, user.id]);
      user = activateResult.rows[0];
    }
    
    // Generate JWT token
    const token = generateToken(user);
    
    await client.query('COMMIT');
    
    return {
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
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
