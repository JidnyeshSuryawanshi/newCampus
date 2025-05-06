const express = require('express');
const router = express.Router();
const { 
  createMess, 
  getAllMess, 
  getMess, 
  updateMess, 
  deleteMess, 
  getOwnerMess,
  deleteMessImage,
  getMessServicesForStudents
} = require('../Controllers/messController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const fs = require('fs');
const path = require('path');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Student dashboard route
router.route('/student-dashboard')
  .get(protect, authorize('student'), getMessServicesForStudents);

// Routes
router.route('/')
  .get(getAllMess)
  .post(
    protect, 
    authorize('messOwner'), 
    upload.array('images', 5), 
    createMess
  );

router.route('/owner')
  .get(protect, authorize('messOwner'), getOwnerMess);

router.route('/:id')
  .get(getMess)
  .put(
    protect, 
    authorize('messOwner'), 
    upload.array('images', 5), 
    updateMess
  )
  .delete(protect, authorize('messOwner'), deleteMess);

router.route('/:id/images/:imageId')
  .delete(protect, authorize('messOwner'), deleteMessImage);

module.exports = router;
