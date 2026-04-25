const pool = require('../config/db');
const path = require('path');
const fs = require('fs').promises;

/**
 * Find or create patient by phone number
 * @param {string} phone - Patient phone number
 * @param {string} name - Patient name (for future use)
 * @returns {Promise<string>} Patient ID
 */
async function findOrCreatePatient(phone, name) {
  const client = await pool.connect();
  
  try {
    // Check if patient exists
    const checkQuery = 'SELECT id FROM users WHERE phone = $1';
    const result = await client.query(checkQuery, [phone]);
    
    if (result.rows.length > 0) {
      return result.rows[0].id;
    }
    
    // Create new patient (inactive until they verify via OTP)
    const createQuery = `
      INSERT INTO users (phone, is_active)
      VALUES ($1, $2)
      RETURNING id
    `;
    const newUser = await client.query(createQuery, [phone, false]);
    
    return newUser.rows[0].id;
    
  } finally {
    client.release();
  }
}

/**
 * Save uploaded file
 * @param {Object} file - Multer file object
 * @returns {Promise<Object>} File information
 */
async function saveUploadedFile(file) {
  // Generate unique filename
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(7);
  const ext = path.extname(file.originalname);
  const filename = `report_${timestamp}_${randomString}${ext}`;
  
  // Define upload directory
  const uploadDir = path.join(__dirname, '../../uploads');
  const filePath = path.join(uploadDir, filename);
  
  // Ensure upload directory exists
  await fs.mkdir(uploadDir, { recursive: true });
  
  // Move file to uploads directory
  await fs.writeFile(filePath, file.buffer);
  
  return {
    filename,
    path: `/uploads/${filename}`,
    size: file.size,
    mimetype: file.mimetype
  };
}

/**
 * Create report record in database
 * @param {Object} reportData - Report information
 * @returns {Promise<Object>} Created report
 */
async function createReport(reportData) {
  const client = await pool.connect();
  
  try {
    const query = `
      INSERT INTO reports (
        patient_id,
        lab_id,
        file_name,
        file_hash,
        created_at
      )
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING id, patient_id, lab_id, file_name, created_at
    `;
    
    const result = await client.query(query, [
      reportData.patient_id,
      reportData.lab_id,
      reportData.file_name,
      reportData.file_hash
    ]);
    
    return result.rows[0];
    
  } finally {
    client.release();
  }
}

/**
 * Process report upload
 * @param {string} labId - Lab ID from JWT
 * @param {Object} data - Upload data (patient_phone, patient_name, test_name)
 * @param {Object} file - Uploaded file
 * @returns {Promise<Object>} Upload result
 */
async function processReportUpload(labId, data, file) {
  // Find or create patient
  const patientId = await findOrCreatePatient(data.patient_phone, data.patient_name);
  
  // Save uploaded file
  const fileInfo = await saveUploadedFile(file);
  
  // Create filename with test name
  const fileName = `${data.test_name}_${fileInfo.filename}`;
  
  // Create report record
  const report = await createReport({
    patient_id: patientId,
    lab_id: labId,
    file_name: fileName,
    file_hash: fileInfo.filename // Use filename as hash for now
  });
  
  return {
    success: true,
    message: 'Report uploaded successfully',
    report: {
      id: report.id,
      patient_id: report.patient_id,
      file_name: report.file_name,
      uploaded_at: report.created_at
    }
  };
}

module.exports = {
  findOrCreatePatient,
  saveUploadedFile,
  createReport,
  processReportUpload
};
