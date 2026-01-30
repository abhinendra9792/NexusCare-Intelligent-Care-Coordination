const crypto = require('crypto');

/**
 * Generate a 6-digit numeric OTP
 * Uses crypto.randomInt for cryptographically secure random number
 * @returns {string} 6-digit OTP
 */
function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

module.exports = { generateOTP };
