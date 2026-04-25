const pool = require('../config/db');

/**
 * Fetch reports for authenticated user
 * @param {string} userId - Authenticated user's ID
 * @returns {Promise<Array>} List of reports with lab information
 */
async function getUserReports(userId) {
  const client = await pool.connect();
  
  try {
    // Fetch reports with lab information
    const query = `
      SELECT 
        r.id AS report_id,
        l.name AS lab_name,
        r.file_name,
        r.file_path,
        r.file_size,
        r.report_type,
        r.created_at
      FROM reports r
      INNER JOIN labs l ON r.lab_id = l.id
      WHERE r.patient_id = $1
      ORDER BY r.created_at DESC
    `;
    
    const result = await client.query(query, [userId]);
    
    return result.rows;
  } finally {
    client.release();
  }
}

/**
 * Log report access
 * @param {string} reportId - Report ID
 * @param {string} userId - User ID who accessed the report
 * @returns {Promise<void>}
 */
async function logReportAccess(reportId, userId) {
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

/**
 * Log access for multiple reports
 * @param {Array} reportIds - Array of report IDs
 * @param {string} userId - User ID who accessed the reports
 * @returns {Promise<void>}
 */
async function logMultipleReportAccess(reportIds, userId) {
  if (reportIds.length === 0) {
    return;
  }
  
  const client = await pool.connect();
  
  try {
    // Build bulk insert query
    const values = reportIds.map((reportId, index) => {
      const offset = index * 2;
      return `($${offset + 1}, $${offset + 2}, NOW())`;
    }).join(', ');
    
    const query = `
      INSERT INTO access_logs (report_id, accessed_by, accessed_at)
      VALUES ${values}
    `;
    
    // Flatten array: [reportId1, userId, reportId2, userId, ...]
    const params = reportIds.flatMap(reportId => [reportId, userId]);
    
    await client.query(query, params);
  } finally {
    client.release();
  }
}

module.exports = {
  getUserReports,
  logReportAccess,
  logMultipleReportAccess
};
