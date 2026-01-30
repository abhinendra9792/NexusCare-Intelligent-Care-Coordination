const { isValidPhone } = require('../utils/validators');
const { isValidOTP } = require('../utils/otpValidator');
const { generateLoginOTP, verifyLoginOTP } = require('../services/otpService');

/**
 * Request OTP for login
 * @route POST /api/auth/request-otp
 */
async function requestOTP(req, res) {
  try {
    const { phone } = req.body;
    
    // Validate phone number presence
    if (!phone) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required'
      });
    }
    
    // Validate phone number format
    if (!isValidPhone(phone)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number format'
      });
    }
    
    // Generate and store OTP
    const result = await generateLoginOTP(phone);
    
    // Return success response
    return res.status(200).json({
      success: true,
      message: result.message
    });
    
  } catch (error) {
    console.error('Error in requestOTP:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Failed to generate OTP. Please try again.'
    });
  }
}

/**
 * Verify OTP and login
 * @route POST /api/auth/verify-otp
 */
async function verifyOTP(req, res) {
  try {
    const { phone, otp } = req.body;
    
    // Validate phone number presence
    if (!phone) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required'
      });
    }
    
    // Validate OTP presence
    if (!otp) {
      return res.status(400).json({
        success: false,
        error: 'OTP is required'
      });
    }
    
    // Validate phone number format
    if (!isValidPhone(phone)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number format'
      });
    }
    
    // Validate OTP format
    if (!isValidOTP(otp)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid OTP format. OTP must be 6 digits'
      });
    }
    
    // Verify OTP and generate token
    const result = await verifyLoginOTP(phone, otp);
    
    // Return success response with token
    return res.status(200).json({
      success: true,
      message: result.message,
      token: result.token
    });
    
  } catch (error) {
    console.error('Error in verifyOTP:', error);
    
    // Handle specific error messages
    if (error.message.includes('Invalid OTP') || 
        error.message.includes('expired') ||
        error.message.includes('used')) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Failed to verify OTP. Please try again.'
    });
  }
}

module.exports = {
  requestOTP,
  verifyOTP
};
