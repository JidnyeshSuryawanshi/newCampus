const express = require('express');
const router = express.Router();
const { getUserById } = require('../Controllers/authController');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/users/:userId
// @desc    Get user by ID
// @access  Public (can be made protected with middleware if needed)
router.get('/:userId', getUserById);

module.exports = router; 