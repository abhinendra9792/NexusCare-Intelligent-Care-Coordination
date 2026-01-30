/**
 * shareRoutes.js
 * PUBLIC routes for viewing shared reports via token
 * No authentication required - uses token validation instead
 */

const express = require('express');
const router = express.Router();
const { viewSharedReport } = require('../controllers/reportController');

/**
 * GET /api/share/:token
 * Public route - no authentication required
 * View shared report via token (read-only, time-limited)
 * 
 * Security:
 * - Token validated server-side
 * - Checks expiry timestamp
 * - Checks if revoked
 * - Logs IP address and access time
 * - View-only (no download button)
 */
router.get('/:token', viewSharedReport);

module.exports = router;
