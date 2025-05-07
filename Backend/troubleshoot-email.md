# Email Configuration Troubleshooting Guide

If you're receiving a 500 error during registration with the message "Failed to send verification email", follow these steps to identify and fix the issue:

## Step 1: Check your .env file

Make sure your `.env` file in the Backend directory contains all the required email settings:

```
# Email Configuration
SMTP_HOST=smtp.gmail.com  # or your email provider's SMTP server
SMTP_PORT=465            # 465 for SSL, 587 for TLS
SMTP_SECURE=true         # true for 465, false for 587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_NAME=Campus Cove
FROM_EMAIL=your-email@gmail.com
```

## Step 2: Verify your App Password (for Gmail)

If you're using Gmail, you need to:
1. Make sure 2-Step Verification is enabled on your Google account
2. Generate an App Password at https://myaccount.google.com/apppasswords
3. Use the generated App Password in your .env file (no spaces)

## Step 3: Common issues and solutions

### Wrong port or secure setting
- For Gmail with SSL: `SMTP_PORT=465` and `SMTP_SECURE=true`
- For Gmail with TLS: `SMTP_PORT=587` and `SMTP_SECURE=false`

### Authentication issues
- Double-check your email and password
- For Gmail, make sure you're using an App Password, not your regular password
- Verify that your account doesn't have additional security restrictions

### Network or firewall issues
- Check if your network allows outgoing connections on the SMTP port
- Some educational or corporate networks block SMTP connections

## Step 4: Try an alternative email provider

If Gmail isn't working, consider using:
- SendGrid (https://sendgrid.com) - offers a free tier
- Mailgun (https://www.mailgun.com) - offers a free tier
- Amazon SES (https://aws.amazon.com/ses/) - pay as you go

## Step 5: Use Ethereal for testing

For testing purposes, you can use Ethereal Email:

```javascript
// Update your sendEmail.js to use Ethereal for testing
const testAccount = await nodemailer.createTestAccount();

const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  secure: false,
  auth: {
    user: testAccount.user,
    pass: testAccount.pass,
  },
});
```

## Step 6: Debugging

Add this debugging code to your sendEmail.js file to see what's happening:

```javascript
console.log('Email config:', {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  user: process.env.SMTP_USER,
  from: process.env.FROM_EMAIL
});
``` 