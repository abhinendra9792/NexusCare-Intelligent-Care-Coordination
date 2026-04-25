const { authenticateLab } = require('../services/labAuthService');

/**
 * Lab login with email and password
 * @route POST /api/lab/auth/login
 */
async function labLogin(req, res) {
  try {
    const { email, password } = req.body;
    
    // Validate email presence
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }
    
    // Validate password presence
    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Password is required'
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }
    
    // Authenticate lab
    const result = await authenticateLab(email, password);
    
    // Return success response with token
    return res.status(200).json({
      success: true,
      message: result.message,
      token: result.token,
      lab: result.lab
    });
    
  } catch (error) {
    console.error('Error in labLogin:', error);
    
    // Handle authentication errors
    if (error.message.includes('Invalid email or password')) {
      return res.status(401).json({
        success: false,
        error: error.message
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Login failed. Please try again.'
    });
  }
}

module.exports = {
  labLogin
};
