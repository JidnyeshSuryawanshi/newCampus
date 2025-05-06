const express = require('express');
const router = express.Router();
const { 
  createGym, 
  getAllGyms, 
  getGym, 
  updateGym, 
  deleteGym, 
  getOwnerGyms,
  deleteGymImage,
  getGymServicesForStudents
} = require('../Controllers/gymController');
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
  .get(protect, authorize('student'), getGymServicesForStudents);

// Routes
router.route('/')
  .get(getAllGyms)
  .post(
    protect, 
    authorize('gymOwner'), 
    upload.array('images', 5), 
    createGym
  );

router.route('/owner')
  .get(protect, authorize('gymOwner'), getOwnerGyms);

router.route('/:id')
  .get(getGym)
  .put(
    protect, 
    authorize('gymOwner'), 
    upload.array('images', 5), 
    updateGym
  )
  .delete(protect, authorize('gymOwner'), deleteGym);

router.route('/:id/images/:imageId')
  .delete(protect, authorize('gymOwner'), deleteGymImage);

module.exports = router;
