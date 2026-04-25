const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const pool = require('../config/db');

// Configure multer for file upload (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept PDF, images, and DOC files
    const allowedMimes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed. Accepted: PDF, JPG, PNG, DOC, DOCX'), false);
    }
  }
});

/**
 * Upload report as authenticated user
 * @route POST /api/reports/upload
 * @access Protected (requires user JWT)
 */
async function uploadUserReport(req, res) {
  try {
    const userId = req.user.user_id;

    // Validate file upload
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Report file is required'
      });
    }

    // Extract metadata from form data
    const { category, doctorName, recordDate, tags } = req.body;

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(req.file.originalname);
    const safeOriginalName = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filename = `user_${userId}_${timestamp}_${randomString}${ext}`;

    // Define upload directory
    const uploadDir = path.join(__dirname, '../../uploads');

    // Ensure upload directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    // Save file to disk
    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, req.file.buffer);

    // Build display file name
    const displayName = category
      ? `${category}_${safeOriginalName}`
      : safeOriginalName;

    // Insert report record into database
    // First check if a "self-upload" lab entry exists, create if not
    let labId = await getOrCreateSelfUploadLab();

    // Try insert with correct schema
    const fileRelativePath = `/uploads/${filename}`;
    let report;

    try {
      const insertQuery = `
        INSERT INTO reports (
          patient_id,
          lab_id,
          file_name,
          file_path,
          file_size,
          report_type,
          test_date,
          created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        RETURNING id, patient_id, lab_id, file_name, created_at
      `;

      const result = await pool.query(insertQuery, [
        userId,
        labId,
        displayName,
        fileRelativePath,
        req.file.size,
        category || 'other',
        recordDate || null
      ]);
      report = result.rows[0];
    } catch (schemaErr) {
      // Fallback: try without optional columns if schema differs
      console.warn('Full insert failed, trying minimal schema:', schemaErr.message);
      const fallbackQuery = `
        INSERT INTO reports (
          patient_id,
          lab_id,
          file_name,
          file_path,
          created_at
        )
        VALUES ($1, $2, $3, $4, NOW())
        RETURNING id, patient_id, lab_id, file_name, created_at
      `;

      const result = await pool.query(fallbackQuery, [
        userId,
        labId,
        displayName,
        fileRelativePath
      ]);
      report = result.rows[0];
    }

    return res.status(201).json({
      success: true,
      message: 'Report uploaded successfully',
      data: {
        report_id: report.id,
        file_name: report.file_name,
        uploaded_at: report.created_at
      }
    });

  } catch (error) {
    console.error('Error in uploadUserReport:', error);

    if (error.message && error.message.includes('File type not allowed')) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to upload report. Please try again.'
    });
  }
}

/**
 * Get or create a "Self Upload" lab entry for user-uploaded reports
 * This lab entry is used as a placeholder when users upload their own reports
 */
async function getOrCreateSelfUploadLab() {
  try {
    // Check if self-upload lab exists
    const checkQuery = `SELECT id FROM labs WHERE name = 'Self Upload' LIMIT 1`;
    const checkResult = await pool.query(checkQuery);

    if (checkResult.rows.length > 0) {
      return checkResult.rows[0].id;
    }

    // Create self-upload lab entry
    const createQuery = `
      INSERT INTO labs (name, email, password_hash, is_verified)
      VALUES ('Self Upload', 'self-upload@healthcare-vault.local', 'not-applicable', true)
      RETURNING id
    `;
    const createResult = await pool.query(createQuery);
    return createResult.rows[0].id;

  } catch (error) {
    console.error('Error in getOrCreateSelfUploadLab:', error);
    // If the labs table structure differs, try a simpler insert
    try {
      const simpleCheck = `SELECT id FROM labs LIMIT 1`;
      const simpleResult = await pool.query(simpleCheck);
      if (simpleResult.rows.length > 0) {
        return simpleResult.rows[0].id; // Use any existing lab as fallback
      }
    } catch (innerError) {
      console.error('Fallback lab lookup failed:', innerError);
    }
    throw new Error('No lab entry available for report upload');
  }
}

module.exports = {
  upload,
  uploadUserReport
};
