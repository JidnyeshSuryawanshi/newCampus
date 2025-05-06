const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../Controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, getProfile);

// Protected route example
router.get('/me', protect, (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user
  });
});

module.exports = router;
