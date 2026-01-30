const { isValidPhone } = require('../utils/validators');
const { isValidOTP } = require('../utils/otpValidator');
const {
  findUserByPhone,
  createFamilyLinkRequest,
  generateFamilyApprovalOTP,
  approveFamilyLink,
  isFamilyLinkApproved,
  getFamilyMemberReports,
  logFamilyReportAccess
} = require('../services/familyService');

/**
 * Request family access
 * @route POST /api/family/request
 * @access Protected (requires patient JWT)
 */
async function requestFamilyAccess(req, res) {
  try {
    const requesterId = req.user.user_id; // Authenticated user
    const { family_phone, relation } = req.body;
    
    // Validate inputs
    if (!family_phone) {
      return res.status(400).json({
        success: false,
        error: 'Family member phone number is required'
      });
    }
    
    if (!relation) {
      return res.status(400).json({
        success: false,
        error: 'Relation is required'
      });
    }
    
    // Validate phone format
    if (!isValidPhone(family_phone)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number format'
      });
    }
    
    // Validate relation
    const validRelations = ['father', 'mother', 'spouse', 'child', 'sibling'];
    if (!validRelations.includes(relation.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid relation. Must be one of: father, mother, spouse, child, sibling'
      });
    }
    
    // Find family member by phone
    const familyMember = await findUserByPhone(family_phone);
    
    if (!familyMember) {
      return res.status(404).json({
        success: false,
        error: 'Family member not found. They must be registered in the system.'
      });
    }
    
    // Cannot link to yourself
    if (familyMember.id === requesterId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot create family link with yourself'
      });
    }
    
    // Create family link request
    const familyLink = await createFamilyLinkRequest(
      requesterId,
      familyMember.id,
      relation.toLowerCase()
    );
    
    // Generate OTP for family member to approve
    await generateFamilyApprovalOTP(family_phone, familyLink.id);
    
    return res.status(200).json({
      success: true,
      message: 'Family access request sent. OTP sent to family member for approval.',
      link_id: familyLink.id
    });
    
  } catch (error) {
    console.error('Error in requestFamilyAccess:', error);
    
    // Handle specific errors
    if (error.message.includes('already')) {
      return res.status(409).json({
        success: false,
        error: error.message
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Failed to request family access'
    });
  }
}

/**
 * Approve family access
 * @route POST /api/family/approve
 * @access Public (uses OTP for auth)
 */
async function approveFamilyAccess(req, res) {
  try {
    const { requester_phone, otp } = req.body;
    
    // Validate inputs
    if (!requester_phone) {
      return res.status(400).json({
        success: false,
        error: 'Requester phone number is required'
      });
    }
    
    if (!otp) {
      return res.status(400).json({
        success: false,
        error: 'OTP is required'
      });
    }
    
    // Validate phone format
    if (!isValidPhone(requester_phone)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number format'
      });
    }
    
    // Validate OTP format
    if (!isValidOTP(otp)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid OTP format. OTP must be 6 digits'
      });
    }
    
    // Get approver's phone from request (could be from JWT if they're logged in)
    // For simplicity, we'll require them to provide their own phone
    const { approver_phone } = req.body;
    
    if (!approver_phone) {
      return res.status(400).json({
        success: false,
        error: 'Approver phone number is required'
      });
    }
    
    // Approve family link
    const result = await approveFamilyLink(requester_phone, approver_phone, otp);
    
    return res.status(200).json({
      success: true,
      message: result.message
    });
    
  } catch (error) {
    console.error('Error in approveFamilyAccess:', error);
    
    // Handle specific errors
    if (error.message.includes('Invalid') || error.message.includes('expired')) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Failed to approve family access'
    });
  }
}

/**
 * Get family member's reports
 * @route GET /api/family/:family_patient_id/reports
 * @access Protected (requires patient JWT)
 */
async function getFamilyReports(req, res) {
  try {
    const requesterId = req.user.user_id; // Authenticated user
    const { family_patient_id } = req.params;
    
    // Validate family_patient_id
    if (!family_patient_id) {
      return res.status(400).json({
        success: false,
        error: 'Family patient ID is required'
      });
    }
    
    // Check if family link is approved
    const isApproved = await isFamilyLinkApproved(requesterId, family_patient_id);
    
    if (!isApproved) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. No approved family link exists.'
      });
    }
    
    // Fetch family member's reports
    const reports = await getFamilyMemberReports(family_patient_id);
    
    // Log access for all reports
    if (reports.length > 0) {
      const reportIds = reports.map(report => report.report_id);
      await logFamilyReportAccess(reportIds, requesterId, family_patient_id);
    }
    
    return res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });
    
  } catch (error) {
    console.error('Error in getFamilyReports:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve family reports'
    });
  }
}

module.exports = {
  requestFamilyAccess,
  approveFamilyAccess,
  getFamilyReports,
  getMyFamilyMembers,
  revokeFamilyAccess
};

/**
 * Get list of family members (both requesting and granting access)
 * @route GET /api/family/members
 * @access Protected (requires patient JWT)
 */
async function getMyFamilyMembers(req, res) {
  try {
    const userId = req.user.user_id;
    const db = require('../config/database');
    
    // Get family links where user is patient (granting access to others)
    const query = `
      SELECT 
        fl.link_id,
        fl.family_patient_id,
        fl.requester_patient_id,
        fl.relation,
        fl.status,
        fl.requested_at,
        fl.approved_at,
        u.phone as family_phone,
        CASE 
          WHEN fl.requester_patient_id = $1 THEN 'requesting'
          ELSE 'granting'
        END as access_type
      FROM family_links fl
      LEFT JOIN users u ON u.user_id = fl.family_patient_id
      WHERE (fl.requester_patient_id = $1 OR fl.family_patient_id = $1)
        AND fl.status IN ('pending', 'approved')
      ORDER BY fl.requested_at DESC
    `;
    
    const result = await db.query(query, [userId]);
    
    return res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows.map(row => ({
        link_id: row.link_id,
        family_phone: row.family_phone,
        family_name: row.relation,
        status: row.status,
        access_type: row.access_type,
        requested_at: row.requested_at,
        approved_at: row.approved_at
      }))
    });
    
  } catch (error) {
    console.error('Error in getMyFamilyMembers:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve family members'
    });
  }
}

/**
 * Revoke family access
 * @route DELETE /api/family/revoke/:link_id
 * @access Protected (requires patient JWT)
 */
async function revokeFamilyAccess(req, res) {
  try {
    const userId = req.user.user_id;
    const { link_id } = req.params;
    const db = require('../config/database');
    
    if (!link_id) {
      return res.status(400).json({
        success: false,
        error: 'Link ID is required'
      });
    }
    
    // Verify user owns this link
    const verifyQuery = `
      SELECT link_id FROM family_links 
      WHERE link_id = $1 
        AND (requester_patient_id = $2 OR family_patient_id = $2)
        AND status = 'approved'
    `;
    
    const verifyResult = await db.query(verifyQuery, [link_id, userId]);
    
    if (verifyResult.rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'Access denied or link not found'
      });
    }
    
    // Revoke access by updating status
    const revokeQuery = `
      UPDATE family_links 
      SET status = 'revoked', 
          revoked_at = NOW()
      WHERE link_id = $1
      RETURNING *
    `;
    
    await db.query(revokeQuery, [link_id]);
    
    return res.status(200).json({
      success: true,
      message: 'Family access revoked successfully'
    });
    
  } catch (error) {
    console.error('Error in revokeFamilyAccess:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Failed to revoke family access'
    });
  }
}
