const pool = require('../config/db');
const bcrypt = require('bcrypt');
const { generateToken } = require('../utils/jwtHelper');

/**
 * Authenticate lab with email and password
 * @param {string} email - Lab email
 * @param {string} password - Lab password
 * @returns {Promise<Object>} Authentication result with token
 */
async function authenticateLab(email, password) {
  const client = await pool.connect();
  
  try {
    // Find lab by email
    const query = 'SELECT * FROM labs WHERE email = $1 AND is_active = $2';
    const result = await client.query(query, [email, true]);
    
    if (result.rows.length === 0) {
      throw new Error('Invalid email or password');
    }
    
    const lab = result.rows[0];
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, lab.password_hash);
    
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }
    
    // Generate JWT token with lab_id
    const token = generateToken({
      id: lab.id,
      phone: lab.phone,
      type: 'lab' // Add type to differentiate from patient tokens
    });
    
    return {
      success: true,
      message: 'Login successful',
      token,
      lab: {
        id: lab.id,
        name: lab.name,
        email: lab.email,
        phone: lab.phone
      }
    };
    
  } finally {
    client.release();
  }
}

module.exports = {
  authenticateLab
};
