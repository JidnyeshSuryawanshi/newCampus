require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('Testing email configuration...');
  console.log('Environment variables:');
  console.log('SMTP_HOST:', process.env.SMTP_HOST);
  console.log('SMTP_PORT:', process.env.SMTP_PORT);
  console.log('SMTP_SECURE:', process.env.SMTP_SECURE);
  console.log('SMTP_USER:', process.env.SMTP_USER);
  console.log('FROM_NAME:', process.env.FROM_NAME);
  console.log('FROM_EMAIL:', process.env.FROM_EMAIL);
  
  try {
    // Create a transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      debug: true, // Show debug output
      logger: true // Log information into the console
    });
    
    console.log('Transporter created, verifying connection...');
    
    // Verify connection configuration
    await transporter.verify();
    console.log('Server is ready to take our messages');
    
    // Define email options
    const mailOptions = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: process.env.TEST_EMAIL || process.env.SMTP_USER, // Send to yourself as test
      subject: 'Campus Cove - Email Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5; text-align: center;">Campus Cove Email Test</h2>
          <div style="padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <p>This is a test email from Campus Cove.</p>
            <p>If you're seeing this, your email configuration is working correctly!</p>
          </div>
        </div>
      `,
    };
    
    console.log('Sending test email...');
    
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    console.log('Email test completed successfully');
    
  } catch (error) {
    console.error('Email test failed:');
    console.error(error);
  }
}

testEmail(); 