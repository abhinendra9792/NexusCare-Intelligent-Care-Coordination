const { processReportUpload } = require('../services/labReportService');
const multer = require('multer');

// Configure multer for file upload (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

/**
 * Upload diagnostic report
 * @route POST /api/lab/upload-report
 * @access Protected (requires lab JWT)
 */
async function uploadReport(req, res) {
  try {
    // Get lab ID from JWT middleware
    const labId = req.lab.lab_id;
    
    // Extract form data
    const { patient_phone, patient_name, test_name } = req.body;
    
    // Validate required fields
    if (!patient_phone) {
      return res.status(400).json({
        success: false,
        error: 'Patient phone number is required'
      });
    }
    
    if (!patient_name) {
      return res.status(400).json({
        success: false,
        error: 'Patient name is required'
      });
    }
    
    if (!test_name) {
      return res.status(400).json({
        success: false,
        error: 'Test name is required'
      });
    }
    
    // Validate file upload
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Report file is required'
      });
    }
    
    // Validate phone format (basic)
    const phoneRegex = /^\+?\d{10,15}$/;
    if (!phoneRegex.test(patient_phone.replace(/[\s\-\(\)]/g, ''))) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number format'
      });
    }
    
    // Process report upload
    const result = await processReportUpload(
      labId,
      { patient_phone, patient_name, test_name },
      req.file
    );
    
    // Return success response
    return res.status(201).json({
      success: true,
      message: result.message,
      report: result.report
    });
    
  } catch (error) {
    console.error('Error in uploadReport:', error);
    
    // Handle specific errors
    if (error.message === 'Only PDF files are allowed') {
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

// Export multer middleware and controller
module.exports = {
  upload,
  uploadReport
};
