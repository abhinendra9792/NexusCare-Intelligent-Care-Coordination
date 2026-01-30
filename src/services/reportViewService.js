const pool = require('../config/db');
const path = require('path');
const fs = require('fs');

/**
 * Verify if user has access to view a report
 * @param {string} userId - User requesting access
 * @param {string} reportId - Report ID to access
 * @returns {Promise<Object|null>} Report data if authorized, null otherwise
 */
async function verifyReportAccess(userId, reportId) {
  const client = await pool.connect();
  
  try {
    // Fetch report with patient info
    const reportQuery = `
      SELECT 
        r.id AS id,
        r.patient_id,
        r.lab_id,
        r.file_name,
        r.created_at,
        l.name AS lab_name
      FROM reports r
      INNER JOIN labs l ON r.lab_id = l.id
      WHERE r.id = $1
    `;
    
    const reportResult = await client.query(reportQuery, [reportId]);
    
    if (reportResult.rows.length === 0) {
      return null; // Report not found
    }
    
    const report = reportResult.rows[0];
    
    // Check if user is the report owner
    if (report.patient_id === userId) {
      return report;
    }
    
    // Check if user has approved family access
    const familyLinkQuery = `
      SELECT id FROM family_links
      WHERE owner_patient_id = $1
        AND linked_patient_id = $2
        AND status = $3
    `;
    
    const linkResult = await client.query(familyLinkQuery, [report.patient_id, userId, 'approved']);
    
    if (linkResult.rows.length > 0) {
      return report; // User has approved family access
    }
    
    return null; // No access
    
  } finally {
    client.release();
  }
}

/**
 * Get full file path for report
 * @param {Object} report - Report object
 * @returns {string} Full file path
 */
function getReportFilePath(report) {
  // Get project root directory
  const projectRoot = path.resolve(__dirname, '../../');
  
  // Construct full file path
  const filePath = path.join(projectRoot, 'uploads', report.file_name);
  
  return filePath;
}

/**
 * Check if file exists
 * @param {string} filePath - Path to file
 * @returns {Promise<boolean>} True if file exists
 */
async function fileExists(filePath) {
  try {
    await fs.promises.access(filePath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Log report view access
 * @param {string} reportId - Report ID
 * @param {string} userId - User who accessed
 * @returns {Promise<void>}
 */
async function logReportView(reportId, userId) {
  const client = await pool.connect();
  
  try {
    const query = `
      INSERT INTO access_logs (report_id, accessed_by, accessed_at)
      VALUES ($1, $2, NOW())
    `;
    
    await client.query(query, [reportId, userId]);
  } finally {
    client.release();
  }
}

module.exports = {
  verifyReportAccess,
  getReportFilePath,
  fileExists,
  logReportView
};
