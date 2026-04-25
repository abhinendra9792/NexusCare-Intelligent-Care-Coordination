const express = require('express');
const router = express.Router();
const { labLogin } = require('../controllers/labAuthController');
const { authenticateLab } = require('../middlewares/labAuthMiddleware');
const { upload, uploadReport } = require('../controllers/labReportController');

// Lab authentication
router.post('/auth/login', labLogin);

// Lab report upload (protected)
router.post('/upload-report', authenticateLab, upload.single('report_file'), uploadReport);

module.exports = router;
