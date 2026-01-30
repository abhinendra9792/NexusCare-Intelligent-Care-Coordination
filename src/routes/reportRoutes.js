const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const { getMyReports, viewReport, shareReport, revokeShareLink, getShareAccessLogs } = require('../controllers/reportController');

/**
 * GET /api/reports
 * Protected route - requires valid JWT token
 * Returns authenticated user's reports
 */
router.get('/', authenticate, getMyReports);

/**
 * GET /api/reports/:report_id/view
 * Protected route - requires valid JWT token
 * View report PDF inline (view-only)
 */
router.get('/:report_id/view', authenticate, viewReport);

/**
 * POST /api/reports/:report_id/share
 * Protected route - requires valid JWT token
 * Generate time-limited shareable link for report
 */
router.post('/:report_id/share', authenticate, shareReport);

/**
 * DELETE /api/reports/share/:share_id
 * Protected route - requires valid JWT token
 * Revoke a share link (cancel before expiry)
 */
router.delete('/share/:share_id', authenticate, revokeShareLink);

/**
 * GET /api/reports/:report_id/share-logs
 * Protected route - requires valid JWT token
 * Get access logs for a report (see who viewed shared link)
 */
router.get('/:report_id/share-logs', authenticate, getShareAccessLogs);

module.exports = router;
