const pool = require('../config/db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { generateToken } = require('../utils/jwtHelper');
const { sendOTPEmail } = require('./emailService');

/**
 * Register a new user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} firstName - User first name
 * @param {string} lastName - User last name
 * @returns {Promise<Object>} Created user object
 */
async function registerUser(email, password, firstName = '', lastName = '') {
  const client = await pool.connect();
  
  try {
    // Check if user already exists
    const checkQuery = 'SELECT id FROM users WHERE email = $1';
    const checkResult = await client.query(checkQuery, [email]);
    
    if (checkResult.rows.length > 0) {
      throw new Error('User with this email already exists');
    }
    
    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Create user
    const createQuery = `
      INSERT INTO users (email, password_hash, first_name, last_name, is_active)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, first_name, last_name, created_at
    `;
    
    const result = await client.query(createQuery, [
      email,
      passwordHash,
      firstName,
      lastName,
      true
    ]);
    
    return result.rows[0];
  } finally {
    client.release();
  }
}

/**
 * Login user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User object with JWT token
 */
async function loginUser(email, password) {
  const client = await pool.connect();
  
  try {
    // Find user by email
    const query = 'SELECT * FROM users WHERE email = $1 AND is_active = $2';
    const result = await client.query(query, [email, true]);
    
    if (result.rows.length === 0) {
      throw new Error('Invalid email or password');
    }
    
    const user = result.rows[0];
    
    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!passwordMatch) {
      throw new Error('Invalid email or password');
    }
    
    // Generate JWT token
    const token = generateToken(user);
    
    return {
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        is_active: user.is_active
      }
    };
  } finally {
    client.release();
  }
}

/**
 * Request password reset
 * @param {string} email - User email
 * @returns {Promise<Object>} Result with reset link info
 */
async function requestPasswordReset(email) {
  const client = await pool.connect();
  
  try {
    // Find user
    const userQuery = 'SELECT id FROM users WHERE email = $1';
    const userResult = await client.query(userQuery, [email]);
    
    if (userResult.rows.length === 0) {
      // Don't reveal if email exists (security)
      return {
        success: true,
        message: 'If this email exists, a password reset link has been sent'
      };
    }
    
    const userId = userResult.rows[0].id;
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
    
    // Store reset token
    const insertQuery = `
      INSERT INTO password_reset_tokens (user_id, token, expires_at)
      VALUES ($1, $2, $3)
      RETURNING token
    `;
    
    await client.query(insertQuery, [userId, resetToken, expiresAt]);
    
    // Send email with reset link
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    await sendPasswordResetEmail(email, resetLink);
    
    return {
      success: true,
      message: 'If this email exists, a password reset link has been sent'
    };
  } finally {
    client.release();
  }
}

/**
 * Reset password with token
 * @param {string} token - Password reset token
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} Result
 */
async function resetPassword(token, newPassword) {
  const client = await pool.connect();
  
  try {
    // Find valid reset token
    const tokenQuery = `
      SELECT user_id FROM password_reset_tokens
      WHERE token = $1 AND expires_at > NOW()
    `;
    
    const tokenResult = await client.query(tokenQuery, [token]);
    
    if (tokenResult.rows.length === 0) {
      throw new Error('Invalid or expired reset token');
    }
    
    const userId = tokenResult.rows[0].user_id;
    
    // Hash new password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);
    
    // Update user password
    const updateQuery = `
      UPDATE users
      SET password_hash = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, email
    `;
    
    const updateResult = await client.query(updateQuery, [passwordHash, userId]);
    
    // Delete used tokens
    await client.query('DELETE FROM password_reset_tokens WHERE token = $1', [token]);
    
    return {
      success: true,
      message: 'Password reset successfully'
    };
  } finally {
    client.release();
  }
}

/**
 * Send password reset email
 * @param {string} email - User email
 * @param {string} resetLink - Reset link
 * @returns {Promise<void>}
 */
async function sendPasswordResetEmail(email, resetLink) {
  const nodemailer = require('nodemailer');
  
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Password Reset Request</h2>
      <p>You requested to reset your password. Click the link below to proceed:</p>
      <div style="background-color: #f0f0f0; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p style="color: #666;">Or copy this link: <br/><code>${resetLink}</code></p>
      <p style="color: #999; margin-top: 30px; font-size: 12px;">
        This link expires in 1 hour. If you didn't request this, ignore this email.
      </p>
      <p style="color: #999; font-size: 12px;">Healthcare Vault - Your Health Records Encrypted</p>
    </div>
  `;
  
  await transporter.sendMail({
    from: `Healthcare Vault <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Reset Your Password - Healthcare Vault',
    html: htmlContent
  });
}

module.exports = {
  registerUser,
  loginUser,
  requestPasswordReset,
  resetPassword
};
