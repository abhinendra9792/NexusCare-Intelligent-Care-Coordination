const { getUserReports, logMultipleReportAccess } = require('../services/reportService');
const {
  verifyReportAccess,
  getReportFilePath,
  fileExists,
  logReportView
} = require('../services/reportViewService');
const fs = require('fs');

/**
 * Get authenticated user's reports
 * @route GET /api/reports
 * @access Protected (requires JWT)
 */
async function getMyReports(req, res) {
  try {
    // Get authenticated user's ID from JWT middleware
    const userId = req.user.user_id;
    
    // Fetch user's reports
    const reports = await getUserReports(userId);
    
    // Log access for all reports returned
    if (reports.length > 0) {
      const reportIds = reports.map(report => report.report_id);
      await logMultipleReportAccess(reportIds, userId);
    }
    
    // Return reports (empty array if no reports)
    return res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });
    
  } catch (error) {
    console.error('Error in getMyReports:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve reports'
    });
  }
}

/**
 * View report PDF (view-only, inline)
 * @route GET /api/reports/:report_id/view
 * @access Protected (requires JWT)
 */
async function viewReport(req, res) {
  try {
    const userId = req.user.user_id;
    const { report_id } = req.params;
    
    // Validate report_id
    if (!report_id) {
      return res.status(400).json({
        success: false,
        error: 'Report ID is required'
      });
    }
    
    // Verify access (owner or approved family link)
    const report = await verifyReportAccess(userId, report_id);
    
    if (!report) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You do not have permission to view this report.'
      });
    }
    
    // Get file path
    const filePath = getReportFilePath(report);
    
    // Check if file exists
    const exists = await fileExists(filePath);
    
    if (!exists) {
      console.error(`File not found: ${filePath}`);
      return res.status(404).json({
        success: false,
        error: 'Report file not found'
      });
    }
    
    // Log access
    await logReportView(report_id, userId);
    
    // Detect content type from filename
    const ext = require('path').extname(report.file_name).toLowerCase();
    const mimeTypes = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    // Set response headers for inline viewing
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // Stream file to response
    const fileStream = fs.createReadStream(filePath);
    
    fileStream.on('error', (error) => {
      console.error('Error streaming file:', error);
      
      if (!res.headersSent) {
        return res.status(500).json({
          success: false,
          error: 'Failed to stream report file'
        });
      }
    });
    
    // Pipe file to response
    fileStream.pipe(res);
    
  } catch (error) {
    console.error('Error in viewReport:', error);
    
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        error: 'Failed to view report'
      });
    }
  }
}

/**
 * Delete a report
 * @route DELETE /api/reports/:report_id
 * @access Protected (requires JWT)
 */
async function deleteReport(req, res) {
  try {
    const userId = req.user.user_id;
    const { report_id } = req.params;
    const pool = require('../config/db');
    const path = require('path');
    const fsPromises = require('fs').promises;

    // Verify ownership
    const verifyQuery = `SELECT id, file_name, file_path FROM reports WHERE id = $1 AND patient_id = $2`;
    const verifyResult = await pool.query(verifyQuery, [report_id, userId]);

    if (verifyResult.rows.length === 0) {
      return res.status(403).json({ success: false, error: 'Report not found or access denied' });
    }

    const report = verifyResult.rows[0];

    // Delete file from disk
    try {
      const filePath = report.file_path
        ? path.join(__dirname, '../../', report.file_path)
        : path.join(__dirname, '../../uploads', report.file_name);
      await fsPromises.unlink(filePath);
    } catch (fileErr) {
      console.warn('File deletion warning:', fileErr.message);
    }

    // Delete from database
    await pool.query('DELETE FROM reports WHERE id = $1', [report_id]);

    return res.status(200).json({ success: true, message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Error in deleteReport:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete report' });
  }
}

module.exports = {
  getMyReports,
  viewReport,
  deleteReport,
  shareReport,
  viewSharedReport,
  revokeShareLink,
  getShareAccessLogs
};

/**
 * Generate shareable link for a report
 * @route POST /api/reports/:report_id/share
 * @access Protected
 */
async function shareReport(req, res) {
  try {
    const userId = req.user.user_id;
    const { report_id } = req.params;
    const { expiry } = req.body;
    const pool = require('../config/db');
    const crypto = require('crypto');
    
    // Validate report ownership
    const reportQuery = `
      SELECT id FROM reports 
      WHERE id = $1 AND patient_id = $2
    `;
    
    const reportResult = await pool.query(reportQuery, [report_id, userId]);
    
    if (reportResult.rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to share this report'
      });
    }
    
    // Generate unique token
    const token = crypto.randomBytes(32).toString('hex');
    
    // Calculate expiry timestamp
    const expiryHours = expiry === '1h' ? 1 : expiry === '24h' ? 24 : expiry === '7d' ? 168 : 720; // 30d
    const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000);
    
    // Store share link in database
    const shareQuery = `
      INSERT INTO report_shares (report_id, shared_by, token, expires_at)
      VALUES ($1, $2, $3, $4)
      RETURNING share_id, token, expires_at
    `;
    
    const shareResult = await pool.query(shareQuery, [report_id, userId, token, expiresAt]);
    
    return res.status(200).json({
      success: true,
      data: {
        share_id: shareResult.rows[0].share_id,
        token: shareResult.rows[0].token,
        expires_at: shareResult.rows[0].expires_at
      }
    });
    
  } catch (error) {
    console.error('Error in shareReport:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Failed to generate share link'
    });
  }
}

/**
 * View shared report (public endpoint)
 * @route GET /api/share/:token
 * @access Public
 */
async function viewSharedReport(req, res) {
  try {
    const { token } = req.params;
    const pool = require('../config/db');
    const fs = require('fs').promises;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Share token is required'
      });
    }
    
    // Verify share link exists and is valid
    const shareQuery = `
      SELECT rs.share_id, rs.report_id, rs.expires_at, rs.revoked_at,
             r.file_name, r.patient_id
      FROM report_shares rs
      JOIN reports r ON r.id = rs.report_id
      WHERE rs.token = $1
    `;
    
    const shareResult = await pool.query(shareQuery, [token]);
    
    if (shareResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Invalid or expired share link'
      });
    }
    
    const share = shareResult.rows[0];
    
    // Check if expired
    if (new Date(share.expires_at) < new Date()) {
      return res.status(403).json({
        success: false,
        error: 'This share link has expired'
      });
    }
    
    // Check if revoked
    if (share.revoked_at) {
      return res.status(403).json({
        success: false,
        error: 'This share link has been revoked'
      });
    }
    
    // Get file path
    const filePath = getReportFilePath(share);
    
    // Check if file exists
    const exists = await fileExists(filePath);
    
    if (!exists) {
      return res.status(404).json({
        success: false,
        error: 'Report file not found'
      });
    }
    
    // Log access
    await pool.query(
      'INSERT INTO share_access_logs (share_id, accessed_at, ip_address) VALUES ($1, NOW(), $2)',
      [share.share_id, req.ip]
    );
    
    // Stream PDF (read-only)
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
  } catch (error) {
    console.error('Error in viewSharedReport:', error);
    
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        error: 'Failed to load shared report'
      });
    }
  }
}

/**
 * Revoke a share link
 * @route DELETE /api/reports/:report_id/share/:share_id
 * @access Protected
 */
async function revokeShareLink(req, res) {
  try {
    const userId = req.user.user_id;
    const { share_id } = req.params;
    const pool = require('../config/db');
    
    // Verify ownership
    const verifyQuery = `
      SELECT rs.share_id 
      FROM report_shares rs
      INNER JOIN reports r ON rs.report_id = r.id
      WHERE rs.share_id = $1 AND r.patient_id = $2
    `;
    
    const verifyResult = await pool.query(verifyQuery, [share_id, userId]);
    
    if (verifyResult.rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to revoke this link'
      });
    }
    
    // Revoke the link
    const revokeQuery = `
      UPDATE report_shares 
      SET revoked_at = NOW() 
      WHERE share_id = $1 AND revoked_at IS NULL
      RETURNING share_id
    `;
    
    const revokeResult = await pool.query(revokeQuery, [share_id]);
    
    if (revokeResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Link already revoked or not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Share link revoked successfully'
    });
    
  } catch (error) {
    console.error('Error revoking share link:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to revoke share link'
    });
  }
}

/**
 * Get access logs for a report's share links
 * @route GET /api/reports/:report_id/share-logs
 * @access Protected
 */
async function getShareAccessLogs(req, res) {
  try {
    const userId = req.user.user_id;
    const { report_id } = req.params;
    const pool = require('../config/db');
    
    // Verify ownership
    const verifyQuery = `
      SELECT id FROM reports 
      WHERE id = $1 AND patient_id = $2
    `;
    
    const verifyResult = await pool.query(verifyQuery, [report_id, userId]);
    
    if (verifyResult.rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to view these logs'
      });
    }
    
    // Get share links and access logs
    const logsQuery = `
      SELECT 
        rs.share_id,
        rs.token,
        rs.created_at,
        rs.expires_at,
        rs.revoked_at,
        COUNT(sal.access_id) as access_count,
        MAX(sal.accessed_at) as last_accessed,
        json_agg(
          json_build_object(
            'accessed_at', sal.accessed_at,
            'ip_address', sal.ip_address
          ) ORDER BY sal.accessed_at DESC
        ) FILTER (WHERE sal.access_id IS NOT NULL) as accesses
      FROM report_shares rs
      LEFT JOIN share_access_logs sal ON rs.share_id = sal.share_id
      WHERE rs.report_id = $1
      GROUP BY rs.share_id
      ORDER BY rs.created_at DESC
    `;
    
    const logsResult = await pool.query(logsQuery, [report_id]);
    
    return res.status(200).json({
      success: true,
      data: logsResult.rows
    });
    
  } catch (error) {
    console.error('Error fetching share logs:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch access logs'
    });
  }
}
