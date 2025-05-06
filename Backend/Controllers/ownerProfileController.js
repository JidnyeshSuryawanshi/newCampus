const OwnerProfile = require('../Models/ownerProfile');
const User = require('../Models/user');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// @desc    Get owner profile
// @route   GET /api/owner/profile
// @access  Private (Owner)
exports.getOwnerProfile = asyncHandler(async (req, res, next) => {
  try {
    // Find profile using the user id with full population
    const profile = await OwnerProfile.findOne({ user: req.user.id })
      .populate('user', 'name email userType')
      .lean();

    if (!profile) {
      return res.status(200).json({
        success: true,
        profile: null,
        message: 'Profile not created yet'
      });
    }

    // Ensure all sections exist in the response even if they're empty
    const completeProfile = {
      ...profile,
      personalInfo: profile.personalInfo || {},
      businessInfo: profile.businessInfo || {},
      preferences: profile.preferences || {
        bookingPreferences: {},
        notificationSettings: {}
      },
      documents: profile.documents || []
    };

    res.status(200).json({
      success: true,
      profile: completeProfile
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create owner profile
// @route   POST /api/owner/profile
// @access  Private (Owner)
exports.createOwnerProfile = asyncHandler(async (req, res, next) => {
  // Check if user is an owner
  if (!req.user.userType.includes('Owner')) {
    return next(new ErrorResponse('Only service owners can create an owner profile', 403));
  }

  // Check if profile already exists
  const existingProfile = await OwnerProfile.findOne({ user: req.user.id });
  
  if (existingProfile) {
    return next(new ErrorResponse('Profile already exists, use PUT to update', 400));
  }

  // Create profile
  const profileData = {
    ...req.body,
    user: req.user.id,
    isProfileComplete: true
  };

  const profile = await OwnerProfile.create(profileData);

  res.status(201).json({
    success: true,
    profile
  });
});

// @desc    Update owner profile
// @route   PUT /api/owner/profile
// @access  Private (Owner)
exports.updateOwnerProfile = asyncHandler(async (req, res, next) => {
  // Find profile
  let profile = await OwnerProfile.findOne({ user: req.user.id });

  if (!profile) {
    return next(new ErrorResponse('Profile not found, create one first', 404));
  }

  // Update profile
  profile = await OwnerProfile.findOneAndUpdate(
    { user: req.user.id },
    { ...req.body, updatedAt: Date.now() },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    profile
  });
});

// @desc    Get user details (account + profile)
// @route   GET /api/owner/details
// @access  Private (Owner)
exports.getUserDetails = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    const profile = await OwnerProfile.findOne({ user: req.user.id }).lean();

    // Ensure all sections exist in the response even if they're empty
    const completeProfile = profile ? {
      ...profile,
      personalInfo: profile.personalInfo || {},
      businessInfo: profile.businessInfo || {},
      preferences: profile.preferences || {
        bookingPreferences: {},
        notificationSettings: {}
      },
      documents: profile.documents || []
    } : null;

    res.status(200).json({
      success: true,
      data: {
        user,
        profile: completeProfile
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get profile completion steps
// @route   GET /api/owner/profile/completion-steps
// @access  Private (Owner)
exports.getProfileCompletionSteps = asyncHandler(async (req, res, next) => {
  try {
    // Find profile
    const profile = await OwnerProfile.findOne({ user: req.user.id }).lean();
    
    if (!profile) {
      return res.status(200).json({
        success: true,
        completionSteps: {
          personal: false,
          business: false,
          preferences: false,
          documents: false
        },
        completionPercentage: 0
      });
    }

    // Calculate completion steps
    const completionSteps = {
      personal: Boolean(
        profile.personalInfo && 
        profile.personalInfo.fullName && 
        profile.personalInfo.phoneNumber
      ),
      business: Boolean(
        profile.businessInfo && 
        profile.businessInfo.businessName && 
        profile.businessInfo.businessType &&
        profile.businessInfo.businessAddress
      ),
      preferences: Boolean(
        profile.preferences && 
        (profile.preferences.bookingPreferences || 
         profile.preferences.notificationSettings)
      ),
      documents: Boolean(
        profile.documents && 
        profile.documents.length > 0
      )
    };

    // Calculate completion percentage
    const completedSteps = Object.values(completionSteps).filter(Boolean).length;
    const totalSteps = Object.keys(completionSteps).length;
    const completionPercentage = Math.round((completedSteps / totalSteps) * 100);

    // Update profile completion status in database
    await OwnerProfile.findOneAndUpdate(
      { user: req.user.id },
      { 
        isProfileComplete: completionPercentage === 100,
        completionPercentage: completionPercentage,
        updatedAt: Date.now() 
      }
    );

    res.status(200).json({
      success: true,
      completionSteps,
      completionPercentage
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update personal information
// @route   PUT /api/owner/profile/personal
// @access  Private (Owner)
exports.updatePersonalInfo = asyncHandler(async (req, res, next) => {
  try {
    // Find profile or create if it doesn't exist
    let profile = await OwnerProfile.findOne({ user: req.user.id });

    if (!profile) {
      profile = await OwnerProfile.create({
        user: req.user.id,
        personalInfo: req.body,
        isProfileComplete: false
      });

      return res.status(201).json({
        success: true,
        data: profile,
        message: 'Personal information created successfully'
      });
    }

    // Update personal info
    profile = await OwnerProfile.findOneAndUpdate(
      { user: req.user.id },
      { 
        personalInfo: req.body,
        updatedAt: Date.now() 
      },
      { new: true, runValidators: false }
    );

    // Update completion status
    await updateProfileCompletion(req.user.id);

    res.status(200).json({
      success: true,
      data: profile,
      message: 'Personal information updated successfully'
    });
  } catch (error) {
    console.error('Error in updatePersonalInfo:', error);
    return next(new ErrorResponse(error.message || 'Error updating personal information', 500));
  }
});

// @desc    Update business information
// @route   PUT /api/owner/profile/business
// @access  Private (Owner)
exports.updateBusinessInfo = asyncHandler(async (req, res, next) => {
  try {
    // Find profile or create if it doesn't exist
    let profile = await OwnerProfile.findOne({ user: req.user.id });

    if (!profile) {
      profile = await OwnerProfile.create({
        user: req.user.id,
        businessInfo: req.body,
        isProfileComplete: false
      });

      return res.status(201).json({
        success: true,
        data: profile,
        message: 'Business information created successfully'
      });
    }

    // Update business info
    profile = await OwnerProfile.findOneAndUpdate(
      { user: req.user.id },
      { 
        businessInfo: req.body,
        updatedAt: Date.now() 
      },
      { new: true, runValidators: false }
    );

    // Update completion status
    await updateProfileCompletion(req.user.id);

    res.status(200).json({
      success: true,
      data: profile,
      message: 'Business information updated successfully'
    });
  } catch (error) {
    console.error('Error in updateBusinessInfo:', error);
    return next(new ErrorResponse(error.message || 'Error updating business information', 500));
  }
});

// @desc    Update preferences
// @route   PUT /api/owner/profile/preferences
// @access  Private (Owner)
exports.updatePreferences = asyncHandler(async (req, res, next) => {
  try {
    // Find profile or create if it doesn't exist
    let profile = await OwnerProfile.findOne({ user: req.user.id });

    if (!profile) {
      profile = await OwnerProfile.create({
        user: req.user.id,
        preferences: req.body,
        isProfileComplete: false
      });

      return res.status(201).json({
        success: true,
        data: profile,
        message: 'Preferences created successfully'
      });
    }

    // Update preferences
    profile = await OwnerProfile.findOneAndUpdate(
      { user: req.user.id },
      { 
        preferences: req.body,
        updatedAt: Date.now() 
      },
      { new: true, runValidators: false }
    );

    // Update completion status
    await updateProfileCompletion(req.user.id);

    res.status(200).json({
      success: true,
      data: profile,
      message: 'Preferences updated successfully'
    });
  } catch (error) {
    console.error('Error in updatePreferences:', error);
    return next(new ErrorResponse(error.message || 'Error updating preferences', 500));
  }
});

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
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

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

// Use multer middleware
exports.uploadDocumentMiddleware = upload.single('document');

// @desc    Upload document
// @route   POST /api/owner/profile/documents
// @access  Private (Owner)
exports.uploadDocument = asyncHandler(async (req, res, next) => {
  try {
    // Ensure uploads directory exists
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Check if file was uploaded
    if (!req.file) {
      return next(new ErrorResponse('Please upload a file', 400));
    }

    // Add logging to debug the upload process
    console.log(`File received: ${req.file.originalname}, size: ${req.file.size}, path: ${req.file.path}`);

    // Upload to cloudinary
    let result;
    try {
      result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'owner_documents',
        resource_type: 'auto'
      });
      console.log('Successfully uploaded to Cloudinary:', result.secure_url);
    } catch (cloudinaryError) {
      console.error('Cloudinary upload error:', cloudinaryError);
      return next(new ErrorResponse('Error uploading to cloud storage', 500));
    }

    // Remove file from local storage
    try {
      fs.unlinkSync(req.file.path);
    } catch (unlinkError) {
      console.error('Error removing temporary file:', unlinkError);
      // Continue execution even if temp file deletion fails
    }

    // Prepare document data
    const documentData = {
      documentType: req.body.documentType || 'other',
      name: req.body.documentName || req.file.originalname,
      documentUrl: result.secure_url,
      cloudinaryId: result.public_id,
      uploadDate: Date.now(),
      verificationStatus: 'pending'
    };

    // Find profile
    let profile = await OwnerProfile.findOne({ user: req.user.id });

    if (!profile) {
      // Create a new profile if it doesn't exist
      profile = await OwnerProfile.create({
        user: req.user.id,
        documents: [documentData],
        isProfileComplete: false
      });

      return res.status(201).json({
        success: true,
        data: documentData,
        message: 'Document uploaded successfully'
      });
    }

    // Add document to profile
    profile = await OwnerProfile.findOneAndUpdate(
      { user: req.user.id },
      { 
        $push: { documents: documentData },
        updatedAt: Date.now() 
      },
      { new: true }
    );

    // Update completion status
    await updateProfileCompletion(req.user.id);

    res.status(200).json({
      success: true,
      data: documentData,
      message: 'Document uploaded successfully'
    });
  } catch (error) {
    console.error('Error in uploadDocument:', error);
    return next(new ErrorResponse(error.message || 'Error uploading document', 500));
  }
});

// @desc    Delete document
// @route   DELETE /api/owner/profile/documents/:documentId
// @access  Private (Owner)
exports.deleteDocument = asyncHandler(async (req, res, next) => {
  try {
    // Find profile
    const profile = await OwnerProfile.findOne({ user: req.user.id });

    if (!profile) {
      return next(new ErrorResponse('Profile not found', 404));
    }

    // Find document in array
    const documentIndex = profile.documents.findIndex(
      doc => doc._id.toString() === req.params.id
    );

    if (documentIndex === -1) {
      return next(new ErrorResponse('Document not found', 404));
    }

    // Get cloudinary ID to delete from cloud storage
    const cloudinaryId = profile.documents[documentIndex].cloudinaryId;

    // Delete from cloudinary if ID exists
    if (cloudinaryId) {
      try {
        await cloudinary.uploader.destroy(cloudinaryId);
      } catch (cloudinaryError) {
        console.error('Cloudinary delete error:', cloudinaryError);
        // Continue execution even if cloudinary deletion fails
      }
    }

    // Remove document from array
    profile.documents.splice(documentIndex, 1);
    await profile.save();

    // Update completion status
    await updateProfileCompletion(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteDocument:', error);
    return next(new ErrorResponse(error.message || 'Error deleting document', 500));
  }
});

// @desc    Upload profile image
// @route   POST /api/owner/profile/profileImage
// @access  Private (Owner)
exports.uploadProfileImage = asyncHandler(async (req, res, next) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return next(new ErrorResponse('Please upload an image', 400));
    }

    // Upload to cloudinary
    let result;
    try {
      result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'owner_profile_images',
        resource_type: 'image'
      });
    } catch (cloudinaryError) {
      console.error('Cloudinary upload error:', cloudinaryError);
      return next(new ErrorResponse('Error uploading to cloud storage', 500));
    }

    // Remove file from local storage
    try {
      fs.unlinkSync(req.file.path);
    } catch (unlinkError) {
      console.error('Error removing temporary file:', unlinkError);
    }

    // Find profile or create if it doesn't exist
    let profile = await OwnerProfile.findOne({ user: req.user.id });

    if (!profile) {
      profile = await OwnerProfile.create({
        user: req.user.id,
        personalInfo: {
          profileImage: {
            public_id: result.public_id,
            url: result.secure_url
          }
        },
        isProfileComplete: false
      });

      return res.status(201).json({
        success: true,
        profileImage: result.secure_url,
        message: 'Profile image uploaded successfully'
      });
    }

    // If profile already has an image, delete the old one from cloudinary
    if (profile.personalInfo && profile.personalInfo.profileImage && profile.personalInfo.profileImage.public_id) {
      try {
        await cloudinary.uploader.destroy(profile.personalInfo.profileImage.public_id);
      } catch (error) {
        console.error('Error deleting old profile image:', error);
      }
    }

    // Update profile with new image
    profile = await OwnerProfile.findOneAndUpdate(
      { user: req.user.id },
      { 
        'personalInfo.profileImage': {
          public_id: result.public_id,
          url: result.secure_url
        },
        updatedAt: Date.now() 
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      profileImage: result.secure_url,
      message: 'Profile image updated successfully'
    });
  } catch (error) {
    console.error('Error in uploadProfileImage:', error);
    return next(new ErrorResponse(error.message || 'Error updating profile image', 500));
  }
});

// Helper function to check and update profile completion status
const updateProfileCompletion = async (userId) => {
  try {
    const profile = await OwnerProfile.findOne({ user: userId }).lean();
    
    if (!profile) return;

    // Check if all required sections are complete
    const isPersonalComplete = Boolean(
      profile.personalInfo && 
      profile.personalInfo.fullName && 
      profile.personalInfo.phoneNumber
    );

    const isBusinessComplete = Boolean(
      profile.businessInfo && 
      profile.businessInfo.businessName && 
      profile.businessInfo.businessType && 
      profile.businessInfo.businessAddress
    );

    const isPreferencesComplete = Boolean(
      profile.preferences && 
      (profile.preferences.bookingPreferences || 
       profile.preferences.notificationSettings)
    );

    const isDocumentsComplete = Boolean(
      profile.documents && 
      profile.documents.length > 0
    );

    // Calculate completion percentage
    const totalSections = 4; // personal, business, preferences, documents
    const completedSections = 
      (isPersonalComplete ? 1 : 0) + 
      (isBusinessComplete ? 1 : 0) + 
      (isPreferencesComplete ? 1 : 0) + 
      (isDocumentsComplete ? 1 : 0);
    
    const completionPercentage = Math.round((completedSections / totalSections) * 100);
    const isComplete = completionPercentage === 100;

    // Update profile with completion status
    await OwnerProfile.findOneAndUpdate(
      { user: userId },
      { 
        isProfileComplete: isComplete,
        completionPercentage: completionPercentage,
        updatedAt: Date.now() 
      }
    );

    return {
      isComplete,
      completionPercentage,
      completionSteps: {
        personal: isPersonalComplete,
        business: isBusinessComplete,
        preferences: isPreferencesComplete,
        documents: isDocumentsComplete
      }
    };
  } catch (error) {
    console.error('Error updating profile completion status:', error);
  }
};

// @desc    Get owner profile by user ID (for students to view)
// @route   GET /api/owner/profile/:userId
// @access  Public
exports.getOwnerProfileById = asyncHandler(async (req, res, next) => {
  try {
    // Find profile using the provided user id with basic user info
    const profile = await OwnerProfile.findOne({ user: req.params.userId })
      .populate('user', 'name email')
      .lean();

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Owner profile not found'
      });
    }

    // Return only necessary information for public viewing
    const publicProfile = {
      user: profile.user,
      personalInfo: {
        fullName: profile.personalInfo?.fullName || '',
        phoneNumber: profile.personalInfo?.phoneNumber || '',
        alternatePhone: profile.personalInfo?.alternatePhone || '',
        profileImage: profile.personalInfo?.profileImage || null
      },
      businessInfo: {
        businessName: profile.businessInfo?.businessName || '',
        businessType: profile.businessInfo?.businessType || '',
        businessAddress: profile.businessInfo?.businessAddress || '',
        establishmentYear: profile.businessInfo?.establishmentYear || ''
      },
      isProfileComplete: profile.isProfileComplete || false
    };

    res.status(200).json({
      success: true,
      profile: publicProfile
    });
  } catch (error) {
    next(error);
  }
});
