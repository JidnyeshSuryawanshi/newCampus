const express = require('express');
const {
  getStudentProfile,
  createStudentProfile,
  updateStudentProfile,
  getProfileStatus,
  uploadProfilePicture,
  getProfileCompletionSteps,
  updatePersonalInfo,
  updateAcademicInfo,
  updatePaymentInfo,
  updatePreferences,
  uploadDocuments,
  deleteDocument,
  getUserDetails
} = require('../Controllers/studentProfileController');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for document uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    // Double-check that the directory exists before saving
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: function(req, file, cb) {
    // Create a safer filename using timestamp and original name
    const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
    cb(null, `${Date.now()}-${sanitizedFilename}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images and PDFs only
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file format. Please upload an image or PDF.'), false);
  }
};

// Configure error handling for multer
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
}).single('document');

// All routes are protected and require student role
router.use(protect);
router.use(authorize('student'));

// Get all user details (account + profile)
router.get('/details', getUserDetails);

// Profile routes
router.route('/profile')
  .get(getStudentProfile)
  .post(createStudentProfile)
  .put(updateStudentProfile);

// Profile status routes
router.get('/profile/status', getProfileStatus);
router.get('/profile/completion-steps', getProfileCompletionSteps);

// Profile picture route
router.put('/profile/picture', uploadProfilePicture);

// Section-specific update routes
router.put('/profile/personal', updatePersonalInfo);
router.put('/profile/academic', updateAcademicInfo);
router.put('/profile/payment', updatePaymentInfo);
router.put('/profile/preferences', updatePreferences);

// Document routes - Using a custom error handler for multer
router.post('/profile/documents', (req, res, next) => {
  upload(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 5MB.'
        });
      }
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`
      });
    } else if (err) {
      // An unknown error occurred
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    
    // Everything went fine, proceed with controller
    uploadDocuments(req, res, next);
  });
});

router.delete('/profile/documents/:id', deleteDocument);

module.exports = router; 