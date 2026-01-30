const { verifyToken } = require('../utils/jwtHelper');

/**
 * JWT Authentication Middleware
 * Protects routes by verifying JWT token from Authorization header
 * 
 * @usage app.use('/api/protected', authenticate)
 * @usage router.get('/profile', authenticate, handler)
 */
async function authenticate(req, res, next) {
  try {
    // Extract Authorization header
    const authHeader = req.headers.authorization;
    
    // Check if Authorization header exists
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Authorization header missing'
      });
    }
    
    // Check if token follows Bearer format
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Invalid authorization format. Use: Bearer <token>'
      });
    }
    
    // Extract token from "Bearer <token>"
    const token = authHeader.substring(7); // Remove "Bearer " prefix
    
    // Check if token exists after Bearer
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token not provided'
      });
    }
    
    // Verify token
    const decoded = verifyToken(token);
    
    // Attach user info to request object
    req.user = {
      user_id: decoded.user_id,
      phone: decoded.phone
    };
    
    // Proceed to next middleware/route handler
    next();
    
  } catch (error) {
    // Handle JWT verification errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token has expired'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }
    
    // Handle other errors
    console.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      error: 'Authentication failed'
    });
  }
}

module.exports = { authenticate };
