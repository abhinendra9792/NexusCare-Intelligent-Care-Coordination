const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const {
  requestFamilyAccess,
  approveFamilyAccess,
  getFamilyReports,
  getMyFamilyMembers,
  revokeFamilyAccess
} = require('../controllers/familyController');

/**
 * POST /api/family/request
 * Protected - requires patient JWT
 * Request access to family member's reports
 */
router.post('/request', authenticate, requestFamilyAccess);

/**
 * POST /api/family/approve
 * Public - uses OTP for authentication
 * Approve family access request
 */
router.post('/approve', approveFamilyAccess);

/**
 * GET /api/family/members
 * Protected - requires patient JWT
 * Get list of family members with access
 */
router.get('/members', authenticate, getMyFamilyMembers);

/**
 * DELETE /api/family/revoke/:link_id
 * Protected - requires patient JWT
 * Revoke family member access
 */
router.delete('/revoke/:link_id', authenticate, revokeFamilyAccess);

/**
 * GET /api/family/:family_patient_id/reports
 * Protected - requires patient JWT
 * View approved family member's reports
 */
router.get('/:family_patient_id/reports', authenticate, getFamilyReports);

module.exports = router;
