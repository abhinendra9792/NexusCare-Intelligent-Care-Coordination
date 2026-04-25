const { registerUser, loginUser, requestPasswordReset, resetPassword } = require('../services/authService');

/**
 * Register a new user
 * @route POST /api/auth/register
 */
async function register(req, res) {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    // Validate email
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }
    
    // Validate password
    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
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
    
    // Register user
    const user = await registerUser(email, password, firstName, lastName);
    
    return res.status(201).json({
      success: true,
      message: 'Registration successful! Please log in.',
      user
    });
    
  } catch (error) {
    console.error('Error in register:', error);
    
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        success: false,
        error: 'User with this email already exists'
      });
    }
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Registration failed'
    });
  }
}

/**
 * Login user with email and password
 * @route POST /api/auth/login
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;
    
    // Validate email
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }
    
    // Validate password
    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Password is required'
      });
    }
    
    // Login user
    const result = await loginUser(email, password);
    
    return res.status(200).json(result);
    
  } catch (error) {
    console.error('Error in login:', error);
    
    if (error.message.includes('Invalid email or password')) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
}

/**
 * Request password reset
 * @route POST /api/auth/forgot-password
 */
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }
    
    const result = await requestPasswordReset(email);
    
    return res.status(200).json(result);
    
  } catch (error) {
    console.error('Error in forgotPassword:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Failed to process password reset request'
    });
  }
}

/**
 * Reset password with token
 * @route POST /api/auth/reset-password
 */
async function resetPasswordHandler(req, res) {
  try {
    const { token, newPassword } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Reset token is required'
      });
    }
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      });
    }
    
    const result = await resetPassword(token, newPassword);
    
    return res.status(200).json(result);
    
  } catch (error) {
    console.error('Error in resetPasswordHandler:', error);
    
    if (error.message.includes('Invalid or expired')) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Password reset failed'
    });
  }
}

module.exports = {
  register,
  login,
  forgotPassword,
  resetPasswordHandler
};
