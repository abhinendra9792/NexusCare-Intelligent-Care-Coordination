const jwt = require('jsonwebtoken');

/**
 * Generate JWT token for authenticated user or lab
 * @param {Object} payload - Token payload (id, phone, and optionally type)
 * @returns {string} JWT token
 */
function generateToken(payload) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  
  // Support both old format {id, phone} and new format with user_id
  const tokenPayload = {
    user_id: payload.user_id || payload.id,
    phone: payload.phone,
    type: payload.type // 'lab' or undefined for patient
  };
  
  const options = {
    expiresIn: '7d' // 7 days
  };
  
  return jwt.sign(tokenPayload, process.env.JWT_SECRET, options);
}

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
function verifyToken(token) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = {
  generateToken,
  verifyToken
};
