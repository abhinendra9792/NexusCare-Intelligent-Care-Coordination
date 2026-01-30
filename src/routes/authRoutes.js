const express = require('express');
const router = express.Router();
const { requestOTP, verifyOTP } = require('../controllers/authController');

// POST /api/auth/request-otp
router.post('/request-otp', requestOTP);

// POST /api/auth/verify-otp
router.post('/verify-otp', verifyOTP);

module.exports = router;
