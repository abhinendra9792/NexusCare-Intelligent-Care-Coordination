const { verifyToken } = require('../utils/jwtHelper');

/**
 * Lab JWT Authentication Middleware
 * Protects lab routes by verifying JWT token from Authorization header
 * 
 * @usage router.post('/upload', authenticateLab, handler)
 */
async function authenticateLab(req, res, next) {
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
    const token = authHeader.substring(7);
    
    // Check if token exists after Bearer
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token not provided'
      });
    }
    
    // Verify token
    const decoded = verifyToken(token);
    
    // Verify it's a lab token
    if (decoded.type !== 'lab') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Lab credentials required.'
      });
    }
    
    // Attach lab info to request object
    req.lab = {
      lab_id: decoded.user_id, // Token has user_id field
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
    console.error('Lab authentication error:', error);
    return res.status(401).json({
      success: false,
      error: 'Authentication failed'
    });
  }
}

module.exports = { authenticateLab };
