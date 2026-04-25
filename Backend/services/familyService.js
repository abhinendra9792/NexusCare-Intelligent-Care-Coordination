const pool = require('../config/db');
const { generateOTP } = require('../utils/otpGenerator');
const { verifyLoginOTP } = require('./otpService');

/**
 * Find user by phone number
 * @param {string} phone - Phone number
 * @returns {Promise<Object|null>} User object or null
 */
async function findUserByPhone(phone) {
  const client = await pool.connect();
  
  try {
    const query = 'SELECT id, phone, is_active FROM users WHERE phone = $1';
    const result = await client.query(query, [phone]);
    
    return result.rows.length > 0 ? result.rows[0] : null;
  } finally {
    client.release();
  }
}

/**
 * Create family link request
 * @param {string} requesterId - User requesting access
 * @param {string} ownerId - Family member whose data will be accessed
 * @param {string} relation - Relationship type
 * @returns {Promise<Object>} Created family link
 */
async function createFamilyLinkRequest(requesterId, ownerId, relation) {
  const client = await pool.connect();
  
  try {
    // Check if link already exists
    const checkQuery = `
      SELECT id, status FROM family_links
      WHERE owner_patient_id = $1 AND linked_patient_id = $2
    `;
    const existing = await client.query(checkQuery, [ownerId, requesterId]);
    
    if (existing.rows.length > 0) {
      const link = existing.rows[0];
      if (link.status === 'approved') {
        throw new Error('Family link already approved');
      }
      if (link.status === 'pending') {
        throw new Error('Family link request already pending');
      }
    }
    
    // Create new family link
    const insertQuery = `
      INSERT INTO family_links (owner_patient_id, linked_patient_id, relation, status)
      VALUES ($1, $2, $3, $4)
      RETURNING id, owner_patient_id, linked_patient_id, relation, status, created_at
    `;
    
    const result = await client.query(insertQuery, [ownerId, requesterId, relation, 'pending']);
    
    return result.rows[0];
  } finally {
    client.release();
  }
}

/**
 * Generate and store OTP for family approval
 * @param {string} phone - Owner's phone number
 * @param {string} familyLinkId - Family link ID
 * @returns {Promise<string>} Generated OTP
 */
async function generateFamilyApprovalOTP(phone, familyLinkId) {
  const client = await pool.connect();
  
  try {
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    
    const query = `
      INSERT INTO otp_records (phone, otp_code, purpose, reference_id, is_used, expires_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `;
    
    await client.query(query, [phone, otpCode, 'family_approval', familyLinkId, false, expiresAt]);
    
    // Log OTP to console (replace with SMS in production)
    console.log(`\n📱 Family Approval OTP for ${phone}: ${otpCode}`);
    console.log(`⏰ Expires in 5 minutes\n`);
    
    return otpCode;
  } finally {
    client.release();
  }
}

/**
 * Verify OTP and approve family link
 * @param {string} requesterPhone - Phone of person who requested access
 * @param {string} approverPhone - Phone of person approving (owner)
 * @param {string} otpCode - OTP to verify
 * @returns {Promise<Object>} Approval result
 */
async function approveFamilyLink(requesterPhone, approverPhone, otpCode) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Find OTP record
    const otpQuery = `
      SELECT * FROM otp_records
      WHERE phone = $1
        AND purpose = $2
        AND is_used = $3
        AND otp_code = $4
      ORDER BY expires_at DESC
      LIMIT 1
    `;
    
    const otpResult = await client.query(otpQuery, [approverPhone, 'family_approval', false, otpCode]);
    
    if (otpResult.rows.length === 0) {
      throw new Error('Invalid or expired OTP');
    }
    
    const otp = otpResult.rows[0];
    
    // Check if OTP expired
    if (new Date() > new Date(otp.expires_at)) {
      throw new Error('OTP has expired');
    }
    
    // Get family link ID from OTP reference
    const familyLinkId = otp.reference_id;
    
    if (!familyLinkId) {
      throw new Error('Invalid OTP reference');
    }
    
    // Find requester by phone
    const requesterQuery = 'SELECT id FROM users WHERE phone = $1';
    const requesterResult = await client.query(requesterQuery, [requesterPhone]);
    
    if (requesterResult.rows.length === 0) {
      throw new Error('Requester not found');
    }
    
    const requesterId = requesterResult.rows[0].id;
    
    // Update family link status
    const updateQuery = `
      UPDATE family_links
      SET status = $1, approved_at = NOW()
      WHERE id = $2 AND linked_patient_id = $3 AND status = $4
      RETURNING *
    `;
    
    const updateResult = await client.query(updateQuery, ['approved', familyLinkId, requesterId, 'pending']);
    
    if (updateResult.rows.length === 0) {
      throw new Error('Family link not found or already processed');
    }
    
    // Mark OTP as used
    await client.query('UPDATE otp_records SET is_used = $1 WHERE id = $2', [true, otp.id]);
    
    await client.query('COMMIT');
    
    return {
      success: true,
      message: 'Family access approved',
      link: updateResult.rows[0]
    };
    
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Check if family link is approved
 * @param {string} requesterId - User requesting access
 * @param {string} ownerId - Owner of the data
 * @returns {Promise<boolean>} True if approved
 */
async function isFamilyLinkApproved(requesterId, ownerId) {
  const client = await pool.connect();
  
  try {
    const query = `
      SELECT id FROM family_links
      WHERE owner_patient_id = $1
        AND linked_patient_id = $2
        AND status = $3
    `;
    
    const result = await client.query(query, [ownerId, requesterId, 'approved']);
    
    return result.rows.length > 0;
  } finally {
    client.release();
  }
}

/**
 * Get family member's reports
 * @param {string} familyPatientId - Family member's patient ID
 * @returns {Promise<Array>} Reports with lab information
 */
async function getFamilyMemberReports(familyPatientId) {
  const client = await pool.connect();
  
  try {
    const query = `
      SELECT 
        r.id AS report_id,
        l.name AS lab_name,
        r.file_name,
        r.created_at
      FROM reports r
      INNER JOIN labs l ON r.lab_id = l.id
      WHERE r.patient_id = $1
      ORDER BY r.created_at DESC
    `;
    
    const result = await client.query(query, [familyPatientId]);
    
    return result.rows;
  } finally {
    client.release();
  }
}

/**
 * Log family report access
 * @param {Array} reportIds - Report IDs accessed
 * @param {string} accessedBy - User who accessed
 * @param {string} familyLinkId - Family link ID
 * @returns {Promise<void>}
 */
async function logFamilyReportAccess(reportIds, accessedBy, familyLinkId) {
  if (reportIds.length === 0) {
    return;
  }
  
  const client = await pool.connect();
  
  try {
    // Build bulk insert for access logs with family link reference
    const values = reportIds.map((reportId, index) => {
      const offset = index * 3;
      return `($${offset + 1}, $${offset + 2}, NOW())`;
    }).join(', ');
    
    const query = `
      INSERT INTO access_logs (report_id, accessed_by, accessed_at)
      VALUES ${values}
    `;
    
    const params = reportIds.flatMap(reportId => [reportId, accessedBy]);
    
    await client.query(query, params);
  } finally {
    client.release();
  }
}

module.exports = {
  findUserByPhone,
  createFamilyLinkRequest,
  generateFamilyApprovalOTP,
  approveFamilyLink,
  isFamilyLinkApproved,
  getFamilyMemberReports,
  logFamilyReportAccess
};
