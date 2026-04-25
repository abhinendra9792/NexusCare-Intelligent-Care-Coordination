/**
 * Validate OTP code format
 * @param {string} otp - OTP code to validate
 * @returns {boolean} true if valid, false otherwise
 */
function isValidOTP(otp) {
  if (!otp || typeof otp !== 'string') {
    return false;
  }
  
  // Must be exactly 6 digits
  const otpRegex = /^\d{6}$/;
  return otpRegex.test(otp);
}

module.exports = { isValidOTP };
