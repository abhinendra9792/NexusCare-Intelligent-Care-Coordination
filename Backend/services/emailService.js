const nodemailer = require('nodemailer');

// Create transporter for sending emails
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

/**
 * Send OTP via email
 * @param {string} email - Recipient email address
 * @param {string} otp - OTP code to send
 * @param {string} purpose - Purpose of OTP (login, signup, password_reset, etc.)
 * @returns {Promise<Object>} Result with success status
 */
async function sendOTPEmail(email, otp, purpose = 'login') {
  try {
    let subject = '';
    let htmlContent = '';

    // Customize email based on purpose
    switch (purpose) {
      case 'signup':
        subject = 'Verify Your Email - Healthcare Vault';
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Welcome to Healthcare Vault!</h2>
            <p>Thank you for signing up. Please verify your email address using the code below:</p>
            <div style="background-color: #f0f0f0; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p style="text-align: center; font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 5px;">${otp}</p>
              <p style="text-align: center; color: #666; margin-top: 10px;">This code expires in 5 minutes</p>
            </div>
            <p>If you didn't sign up for this account, please ignore this email.</p>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">Healthcare Vault - Your Health Records Encrypted</p>
          </div>
        `;
        break;

      case 'password_reset':
        subject = 'Reset Your Password - Healthcare Vault';
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p>We received a request to reset your password. Use the code below to proceed:</p>
            <div style="background-color: #f0f0f0; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p style="text-align: center; font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 5px;">${otp}</p>
              <p style="text-align: center; color: #666; margin-top: 10px;">This code expires in 5 minutes</p>
            </div>
            <p>If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">Healthcare Vault - Your Health Records Encrypted</p>
          </div>
        `;
        break;

      default: // login
        subject = 'Login OTP - Healthcare Vault';
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Your Login Code</h2>
            <p>Use the code below to securely log in to your Healthcare Vault account:</p>
            <div style="background-color: #f0f0f0; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p style="text-align: center; font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 5px;">${otp}</p>
              <p style="text-align: center; color: #666; margin-top: 10px;">This code expires in 5 minutes</p>
            </div>
            <p><strong>Security note:</strong> Never share this code with anyone. We will never ask for it.</p>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">Healthcare Vault - Your Health Records Encrypted</p>
          </div>
        `;
    }

    const mailOptions = {
      from: `Healthcare Vault <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: htmlContent
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log(`✉️ OTP email sent to ${email}`);
    console.log(`📧 Message ID: ${info.messageId}`);

    return {
      success: true,
      message: 'OTP sent successfully to your email',
      email: email
    };

  } catch (error) {
    console.error('❌ Error sending OTP email:', error.message);
    throw new Error(`Failed to send OTP: ${error.message}`);
  }
}

/**
 * Verify transporter connection
 * @returns {Promise<boolean>} true if connection successful
 */
async function verifyEmailConnection() {
  try {
    await transporter.verify();
    console.log('✅ Email service is ready to send messages');
    return true;
  } catch (error) {
    console.error('❌ Email service configuration error:', error.message);
    console.error('   Make sure EMAIL_HOST, EMAIL_USER, and EMAIL_PASSWORD are set correctly in .env');
    return false;
  }
}

module.exports = {
  sendOTPEmail,
  verifyEmailConnection
};
