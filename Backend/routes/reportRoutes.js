const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const { getMyReports, viewReport, deleteReport, shareReport, revokeShareLink, getShareAccessLogs } = require('../controllers/reportController');
const { upload, uploadUserReport } = require('../controllers/userUploadController');
const { analyzeReport } = require('../services/reportAnalysisService');

/**
 * POST /api/reports/upload
 * Protected route - requires valid JWT token
 * Upload a medical report as an authenticated user
 */
router.post('/upload', authenticate, upload.single('file'), uploadUserReport);

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
 * DELETE /api/reports/:report_id
 * Protected route - requires valid JWT token
 * Delete a medical report
 */
router.delete('/:report_id', authenticate, deleteReport);

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

/**
 * POST /api/reports/:report_id/analyze
 * Protected - AI analysis of report file content
 */
router.post('/:report_id/analyze', authenticate, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { report_id } = req.params;
    const { question } = req.body;
    const result = await analyzeReport(report_id, userId, question);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Report analysis error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to analyze report' });
  }
});

module.exports = router;
