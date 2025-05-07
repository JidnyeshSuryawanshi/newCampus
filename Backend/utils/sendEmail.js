const nodemailer = require('nodemailer');

/**
 * Send an email using nodemailer
 * @param {Object} options - Email options
 * @param {String} options.email - Recipient email
 * @param {String} options.subject - Email subject
 * @param {String} options.message - Email message body (HTML)
 */
const sendEmail = async (options) => {
  try {
    let transporter;
    let isEthereal = false;
    
    // Log configuration for debugging
    console.log('Email config:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER,
      from: process.env.FROM_EMAIL
    });
    
    // Use Ethereal Email for testing if env var is set or required values are missing
    if (
      process.env.USE_ETHEREAL === 'true' || 
      !process.env.SMTP_HOST || 
      !process.env.SMTP_USER || 
      !process.env.SMTP_PASSWORD
    ) {
      console.log('Using Ethereal Email for testing...');
      
      // Create test account
      const testAccount = await nodemailer.createTestAccount();
      isEthereal = true;
      
      // Create a testing transporter
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      
      console.log('Created Ethereal test account:', testAccount.user);
    } else {
      // Create a real transporter with provided config
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });
    }

    // Define email options
    const mailOptions = {
      from: isEthereal ? 
        `Campus Cove <no-reply@campuscove.com>` : 
        `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: options.email,
      subject: options.subject,
      html: options.message,
    };

    console.log(`Attempting to send email to: ${options.email}`);
    
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    
    console.log(`Email sent: ${info.messageId}`);
    
    // If using Ethereal, provide preview URL
    if (isEthereal) {
      console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
    
    return info;
  } catch (error) {
    console.error('Email sending error details:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Send an OTP verification email
 * @param {Object} options - Email options
 * @param {String} options.email - Recipient email
 * @param {String} options.username - Recipient username
 * @param {String} options.otp - One-time password
 */
const sendOTPEmail = async (options) => {
  const message = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5; text-align: center;">Campus Cove Email Verification</h2>
      <div style="padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <p>Hello ${options.username},</p>
        <p>Thank you for registering with Campus Cove. To complete your registration, please verify your email address using the following OTP code:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
          <h3 style="margin: 0; color: #333; letter-spacing: 5px; font-size: 24px;">${options.otp}</h3>
        </div>
        <p>This code will expire in 10 minutes. If you did not request this verification, please ignore this email.</p>
        <p>Best regards,<br>Campus Cove Team</p>
      </div>
      <p style="text-align: center; color: #666; font-size: 12px; margin-top: 20px;">
        This is an automated email. Please do not reply to this message.
      </p>
    </div>
  `;

  return sendEmail({
    email: options.email,
    subject: 'Campus Cove - Verify Your Email',
    message,
  });
};

module.exports = {
  sendEmail,
  sendOTPEmail,
}; 