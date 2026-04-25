const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

// Initialize Gemini with dedicated report analysis API key
const reportGenAI = new GoogleGenerativeAI(process.env.GEMINI_REPORT_API_KEY || process.env.GEMINI_API_KEY);

/**
 * Analyze a medical report file (PDF/Image) using Gemini Vision
 * @param {string} reportId - Report ID
 * @param {string} userId - User ID (for ownership verification)
 * @param {string} userQuestion - Optional question about the report
 * @returns {Object} AI analysis result
 */
async function analyzeReport(reportId, userId, userQuestion) {
  // 1. Fetch report from DB
  const reportQuery = `
    SELECT r.id, r.file_name, r.file_path, r.report_type, r.patient_id
    FROM reports r
    WHERE r.id = $1 AND r.patient_id = $2
  `;
  const reportResult = await pool.query(reportQuery, [reportId, userId]);

  if (reportResult.rows.length === 0) {
    throw new Error('Report not found or access denied');
  }

  const report = reportResult.rows[0];

  // 2. Read the file
  const projectRoot = path.resolve(__dirname, '../../');
  const filePath = report.file_path
    ? path.join(projectRoot, report.file_path)
    : path.join(projectRoot, 'uploads', report.file_name);

  if (!fs.existsSync(filePath)) {
    throw new Error('Report file not found on disk');
  }

  const fileBuffer = fs.readFileSync(filePath);
  const base64Data = fileBuffer.toString('base64');

  // 3. Determine MIME type
  const ext = path.extname(report.file_name || report.file_path || '').toLowerCase();
  const mimeMap = {
    '.pdf': 'application/pdf',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png'
  };
  const mimeType = mimeMap[ext] || 'application/pdf';

  // 4. Build the prompt
  const basePrompt = `You are an expert medical report analyst. Analyze this medical report carefully and provide:

1. **Report Summary**: What type of report is this and what does it contain?
2. **Key Findings**: List all important values, measurements, or observations found
3. **Normal vs Abnormal**: Clearly identify which values are normal and which are abnormal or concerning
4. **Health Implications**: Explain what these findings mean for the patient's health in simple language
5. **Recommendations**: Suggest next steps or lifestyle changes based on the findings

Important: Always remind the patient that this AI analysis is for informational purposes only and they should consult their doctor for medical advice.`;

  const prompt = userQuestion
    ? `${basePrompt}\n\nThe patient has a specific question: "${userQuestion}"\nPlease address their question while also providing the general analysis.`
    : basePrompt;

  // 5. Send to Gemini with the file
  const model = reportGenAI.getGenerativeModel(
    { model: "gemini-2.5-flash" },
    { apiVersion: "v1beta" }
  );

  let retries = 2;
  let lastError;

  while (retries >= 0) {
    try {
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Data
          }
        }
      ]);

      const response = result.response;
      const analysisText = response.text();

      // 6. Save analysis to DB (optional - store in chat history)
      try {
        await pool.query(
          `INSERT INTO chat_messages (user_id, message_text, sender, created_at) VALUES ($1, $2, $3, NOW())`,
          [userId, `[Report Analysis] Analyzing: ${report.file_name}`, 'user']
        );
        await pool.query(
          `INSERT INTO chat_messages (user_id, message_text, sender, created_at) VALUES ($1, $2, $3, NOW())`,
          [userId, analysisText, 'assistant']
        );
      } catch (dbErr) {
        console.warn('Could not save analysis to chat history:', dbErr.message);
      }

      return {
        success: true,
        analysis: analysisText,
        report_name: report.file_name,
        report_type: report.report_type
      };

    } catch (error) {
      lastError = error;
      if (error.message?.includes('429') && retries > 0) {
        console.log(`Rate limited on report analysis, retrying in 30s... (${retries} left)`);
        await new Promise(r => setTimeout(r, 30000));
        retries--;
      } else {
        throw error;
      }
    }
  }

  throw lastError;
}

module.exports = { analyzeReport };
