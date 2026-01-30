const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');

/**
 * GET /api/user/profile
 * Protected route - requires valid JWT token
 * Returns authenticated user information
 */
router.get('/profile', authenticate, (req, res) => {
  try {
    // req.user is populated by authenticate middleware
    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      user: {
        user_id: req.user.user_id,
        phone: req.user.phone
      }
    });
  } catch (error) {
    console.error('Error in profile route:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve profile'
    });
  }
});

module.exports = router;
