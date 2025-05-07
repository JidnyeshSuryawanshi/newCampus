const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getProfile, 
  verifyEmail, 
  resendOTP, 
  getUserById 
} = require('../Controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', resendOTP);

// Protected routes
router.get('/profile', protect, getProfile);

// Get user by ID route
router.get('/users/:userId', getUserById);

// Protected route example
router.get('/me', protect, (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user
  });
});

module.exports = router;
