const StudentProfile = require('../Models/studentProfile');
const User = require('../Models/user');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get student profile
// @route   GET /api/student/profile
// @access  Private (Student)
exports.getStudentProfile = asyncHandler(async (req, res, next) => {
  // Find profile using the user id
  const profile = await StudentProfile.findOne({ user: req.user.id });

  if (!profile) {
    return res.status(200).json({
      success: true,
      data: null,
      message: 'Profile not created yet'
    });
  }

  res.status(200).json({
    success: true,
    data: profile
  });
});

// @desc    Create student profile
// @route   POST /api/student/profile
// @access  Private (Student)
exports.createStudentProfile = asyncHandler(async (req, res, next) => {
  // Check if user is a student
  if (req.user.userType !== 'student') {
    return next(new ErrorResponse('Only students can create a student profile', 403));
  }

  // Check if profile already exists
  const existingProfile = await StudentProfile.findOne({ user: req.user.id });
  
  if (existingProfile) {
    return next(new ErrorResponse('Profile already exists, use PUT to update', 400));
  }

  // Create profile
  const profileData = {
    ...req.body,
    user: req.user.id,
    isProfileComplete: true
  };

  const profile = await StudentProfile.create(profileData);

  res.status(201).json({
    success: true,
    data: profile
  });
});

// @desc    Update student profile
// @route   PUT /api/student/profile
// @access  Private (Student)
exports.updateStudentProfile = asyncHandler(async (req, res, next) => {
  // Find profile
  let profile = await StudentProfile.findOne({ user: req.user.id });

  if (!profile) {
    return next(new ErrorResponse('Profile not found, create one first', 404));
  }

  // Update profile
  profile = await StudentProfile.findOneAndUpdate(
    { user: req.user.id },
    { ...req.body, updatedAt: Date.now() },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: profile
  });
});

// @desc    Check profile completion status
// @route   GET /api/student/profile/status
// @access  Private (Student)
exports.getProfileStatus = asyncHandler(async (req, res, next) => {
  // Find profile
  const profile = await StudentProfile.findOne({ user: req.user.id });

  res.status(200).json({
    success: true,
    isProfileComplete: profile ? profile.isProfileComplete : false
  });
});

// @desc    Upload profile picture
// @route   PUT /api/student/profile/picture
// @access  Private (Student)
exports.uploadProfilePicture = asyncHandler(async (req, res, next) => {
  // This is a placeholder for image upload functionality
  // In a real implementation, this would handle file uploads to a service like Cloudinary
  
  if (!req.files || !req.files.profilePicture) {
    return next(new ErrorResponse('Please upload a file', 400));
  }

  const file = req.files.profilePicture;

  // Make sure the image is a photo
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse('Please upload an image file', 400));
  }

  // Here you would upload to your chosen storage service and get back URLs
  // For now we'll simulate this
  const pictureData = {
    public_id: `student-profile-${req.user.id}`,
    url: '/placeholder-image-url.jpg' // This would be the real URL in production
  };

  // Find and update profile
  let profile = await StudentProfile.findOne({ user: req.user.id });

  if (!profile) {
    return next(new ErrorResponse('Profile not found, create one first', 404));
  }

  profile = await StudentProfile.findOneAndUpdate(
    { user: req.user.id },
    { 
      'personalInfo.profilePicture': pictureData,
      updatedAt: Date.now()
    },
    { new: true }
  );

  res.status(200).json({
    success: true,
    data: profile
  });
});

// @desc    Get profile completion steps
// @route   GET /api/student/profile/completion-steps
// @access  Private (Student)
exports.getProfileCompletionSteps = asyncHandler(async (req, res, next) => {
  // Find profile
  const profile = await StudentProfile.findOne({ user: req.user.id });
  
  if (!profile) {
    return res.status(200).json({
      success: true,
      completionSteps: {
        personalInfo: false,
        academicInfo: false,
        preferences: false,
        payment: false,
        documents: false
      },
      completionPercentage: 0
    });
  }
  
  // Get completion status using the helper function
  const completionResult = await updateProfileCompletion(req.user.id);
  
  // Calculate completion percentage
  const steps = Object.values(completionResult).filter(step => typeof step === 'boolean');
  const completedSteps = steps.filter(Boolean).length;
  const totalSteps = steps.length;
  const completionPercentage = Math.floor((completedSteps / totalSteps) * 100);
  
  res.status(200).json({
    success: true,
    completionSteps: {
      personalInfo: completionResult.personalInfo,
      academicInfo: completionResult.academicInfo,
      preferences: completionResult.preferences,
      payment: profile.paymentInfo && 
              profile.paymentInfo.preferredPaymentMethods && 
              profile.paymentInfo.preferredPaymentMethods.length > 0,
      documents: completionResult.documents
    },
    completionPercentage,
    isComplete: completionResult.isComplete,
    isFullyComplete: completionResult.isFullyComplete
  });
});

// Helper function to check and update profile completion status
const updateProfileCompletion = async (userId) => {
  const profile = await StudentProfile.findOne({ user: userId });
  
  if (!profile) return;
  
  // Check if required fields are completed
  const hasPersonalInfo = profile.personalInfo && 
                         profile.personalInfo.fullName && 
                         profile.personalInfo.phoneNumber;
  
  const hasAcademicInfo = profile.academicInfo && 
                         profile.academicInfo.institution && 
                         profile.academicInfo.studentId && 
                         profile.academicInfo.course;
  
  const hasPreferences = profile.preferences &&
                         (profile.preferences.bookingReminders !== undefined ||
                          profile.preferences.emailNotifications !== undefined ||
                          (profile.preferences.servicePreferences && 
                            (profile.preferences.servicePreferences.dietaryPreferences?.length > 0 ||
                             profile.preferences.servicePreferences.accommodationPreferences?.length > 0 ||
                             profile.preferences.servicePreferences.gymPreferences?.length > 0)));

  const hasDocuments = profile.documents && profile.documents.length > 0;
  
  // Mark profile as complete based on completion of required sections
  const isComplete = hasPersonalInfo && hasAcademicInfo;
  const isFullyComplete = isComplete && hasPreferences && hasDocuments;
  
  await StudentProfile.findOneAndUpdate(
    { user: userId },
    { 
      isProfileComplete: isComplete,
      updatedAt: Date.now()
    },
    { new: true }
  );
  
  // Updating completion steps in the response
  return {
    personalInfo: hasPersonalInfo,
    academicInfo: hasAcademicInfo,
    preferences: hasPreferences,
    documents: hasDocuments,
    isComplete,
    isFullyComplete
  };
};

// @desc    Update personal information
// @route   PUT /api/student/profile/personal
// @access  Private (Student)
exports.updatePersonalInfo = asyncHandler(async (req, res, next) => {
  try {
    // Find profile
    let profile = await StudentProfile.findOne({ user: req.user.id });

    if (!profile) {
      // Create a new profile if it doesn't exist with empty required fields to satisfy validation
      profile = await StudentProfile.create({
        user: req.user.id,
        personalInfo: {
          fullName: req.body.fullName,
          phoneNumber: req.body.phoneNumber,
          dateOfBirth: req.body.dateOfBirth,
          gender: req.body.gender
        },
        isProfileComplete: false, // Explicitly set as boolean
        // Add placeholder values for required fields
        academicInfo: {
          institution: "To be updated",
          studentId: "To be updated",
          course: "To be updated"
        },
        contactInfo: {
          currentAddress: {
            street: "",
            city: "To be updated",
            state: "To be updated",
            pincode: "000000"
          }
        }
      });

      return res.status(201).json({
        success: true,
        data: profile,
        message: 'Personal information created successfully'
      });
    }

    // Update personal information
    profile = await StudentProfile.findOneAndUpdate(
      { user: req.user.id },
      { 
        'personalInfo.fullName': req.body.fullName,
        'personalInfo.phoneNumber': req.body.phoneNumber,
        'personalInfo.dateOfBirth': req.body.dateOfBirth,
        'personalInfo.gender': req.body.gender,
        updatedAt: Date.now() 
      },
      { new: true, runValidators: false }  // Disable validators for updates
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

// @desc    Update academic information
// @route   PUT /api/student/profile/academic
// @access  Private (Student)
exports.updateAcademicInfo = asyncHandler(async (req, res, next) => {
  try {
    // Find profile
    let profile = await StudentProfile.findOne({ user: req.user.id });

    if (!profile) {
      // Create a new profile if it doesn't exist with empty required fields to satisfy validation
      profile = await StudentProfile.create({
        user: req.user.id,
        academicInfo: {
          institution: req.body.institution,
          studentId: req.body.studentId,
          course: req.body.course,
          year: req.body.year,
          graduationYear: req.body.graduationYear
        },
        isProfileComplete: false, // Explicitly set as boolean
        // Add placeholder values for required fields
        personalInfo: {
          fullName: "To be updated",
          phoneNumber: "0000000000"
        },
        contactInfo: {
          currentAddress: {
            street: "",
            city: "To be updated",
            state: "To be updated",
            pincode: "000000"
          }
        }
      });

      return res.status(201).json({
        success: true,
        data: profile,
        message: 'Academic information created successfully'
      });
    }

    // Update academic information
    profile = await StudentProfile.findOneAndUpdate(
      { user: req.user.id },
      { 
        'academicInfo.institution': req.body.institution,
        'academicInfo.studentId': req.body.studentId,
        'academicInfo.course': req.body.course,
        'academicInfo.year': req.body.year,
        'academicInfo.graduationYear': req.body.graduationYear,
        updatedAt: Date.now() 
      },
      { new: true, runValidators: false }  // Disable validators for updates
    );

    // Update completion status
    await updateProfileCompletion(req.user.id);

    res.status(200).json({
      success: true,
      data: profile,
      message: 'Academic information updated successfully'
    });
  } catch (error) {
    console.error('Error in updateAcademicInfo:', error);
    return next(new ErrorResponse(error.message || 'Error updating academic information', 500));
  }
});

// @desc    Update payment information
// @route   PUT /api/student/profile/payment
// @access  Private (Student)
exports.updatePaymentInfo = asyncHandler(async (req, res, next) => {
  try {
    // Find profile
    let profile = await StudentProfile.findOne({ user: req.user.id });

    // Format the card number to keep only last 4 digits for security
    const lastFourDigits = req.body.cardNumber ? req.body.cardNumber.slice(-4) : '';
    
    // Determine card network (simple version - could be enhanced)
    let network = 'other';
    if (req.body.cardNumber) {
      const firstDigit = req.body.cardNumber.charAt(0);
      if (firstDigit === '4') network = 'visa';
      else if (firstDigit === '5') network = 'mastercard';
      else if (firstDigit === '6') network = 'rupay';
    }

    // Prepare the payment data
    const cardData = {
      cardHolderName: req.body.cardHolderName,
      lastFourDigits: lastFourDigits,
      expiryDate: req.body.expiryDate,
      network: network
    };

    if (!profile) {
      // Create a new profile if it doesn't exist with empty required fields to satisfy validation
      profile = await StudentProfile.create({
        user: req.user.id,
        paymentInfo: {
          preferredPaymentMethods: ['card'],
          savedCards: req.body.saveCard ? [cardData] : []
        },
        // Add placeholder values for required fields
        personalInfo: {
          fullName: "To be updated",
          phoneNumber: "0000000000"
        },
        academicInfo: {
          institution: "To be updated",
          studentId: "To be updated",
          course: "To be updated"
        },
        contactInfo: {
          currentAddress: {
            street: "",
            city: "To be updated",
            state: "To be updated",
            pincode: "000000"
          }
        }
      });

      return res.status(201).json({
        success: true,
        data: profile,
        message: 'Payment information created successfully'
      });
    }

    // Update payment information based on whether to save the card or not
    let updateOperation;
    
    if (req.body.saveCard) {
      // Add the card to saved cards if user wants to save it
      updateOperation = {
        $push: { 'paymentInfo.savedCards': cardData },
        $addToSet: { 'paymentInfo.preferredPaymentMethods': 'card' },
        updatedAt: Date.now()
      };
    } else {
      // Just update preferred methods without saving the card
      updateOperation = {
        $addToSet: { 'paymentInfo.preferredPaymentMethods': 'card' },
        updatedAt: Date.now()
      };
    }

    profile = await StudentProfile.findOneAndUpdate(
      { user: req.user.id },
      updateOperation,
      { new: true, runValidators: false }  // Disable validators for updates
    );

    // Update completion status
    await updateProfileCompletion(req.user.id);

    res.status(200).json({
      success: true,
      data: profile,
      message: 'Payment information updated successfully'
    });
  } catch (error) {
    console.error('Error in updatePaymentInfo:', error);
    return next(new ErrorResponse(error.message || 'Error updating payment information', 500));
  }
});

// @desc    Update preferences
// @route   PUT /api/student/profile/preferences
// @access  Private (Student)
exports.updatePreferences = asyncHandler(async (req, res, next) => {
  try {
    // Find profile
    let profile = await StudentProfile.findOne({ user: req.user.id });

    if (!profile) {
      // Create a new profile if it doesn't exist with empty required fields
      profile = await StudentProfile.create({
        user: req.user.id,
        preferences: {
          bookingReminders: req.body.bookingReminders,
          emailNotifications: req.body.emailNotifications,
          servicePreferences: {
            dietaryPreferences: req.body.dietaryPreferences || [],
            accommodationPreferences: req.body.accommodationPreferences || [],
            gymPreferences: req.body.gymPreferences || []
          }
        },
        // Add placeholder values for required fields
        personalInfo: {
          fullName: "To be updated",
          phoneNumber: "0000000000"
        },
        academicInfo: {
          institution: "To be updated",
          studentId: "To be updated",
          course: "To be updated"
        },
        contactInfo: {
          currentAddress: {
            street: "",
            city: "To be updated",
            state: "To be updated",
            pincode: "000000"
          }
        }
      });

      return res.status(201).json({
        success: true,
        data: profile,
        message: 'Preferences created successfully'
      });
    }

    // Update preferences
    const updateData = {
      'preferences.bookingReminders': req.body.bookingReminders,
      'preferences.emailNotifications': req.body.emailNotifications,
      updatedAt: Date.now()
    };

    // Update array fields if they exist in the request
    if (req.body.dietaryPreferences) {
      updateData['preferences.servicePreferences.dietaryPreferences'] = req.body.dietaryPreferences;
    }
    
    if (req.body.accommodationPreferences) {
      updateData['preferences.servicePreferences.accommodationPreferences'] = req.body.accommodationPreferences;
    }
    
    if (req.body.gymPreferences) {
      updateData['preferences.servicePreferences.gymPreferences'] = req.body.gymPreferences;
    }

    profile = await StudentProfile.findOneAndUpdate(
      { user: req.user.id },
      updateData,
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

// Configure Cloudinary
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
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

// @desc    Upload documents
// @route   POST /api/student/profile/documents
// @access  Private (Student)
exports.uploadDocuments = asyncHandler(async (req, res, next) => {
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
        folder: 'student_documents',
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
      name: req.body.name || req.file.originalname,
      type: req.body.type || 'identity',
      cloudinaryId: result.public_id,
      url: result.secure_url,
      uploadedAt: Date.now()
    };

    // Find profile
    let profile = await StudentProfile.findOne({ user: req.user.id });

    if (!profile) {
      // Create a new profile if it doesn't exist with empty required fields
      profile = await StudentProfile.create({
        user: req.user.id,
        documents: [documentData],
        // Set isProfileComplete explicitly as a boolean
        isProfileComplete: false,
        // Add placeholder values for required fields
        personalInfo: {
          fullName: "To be updated",
          phoneNumber: "0000000000"
        },
        academicInfo: {
          institution: "To be updated",
          studentId: "To be updated",
          course: "To be updated"
        },
        contactInfo: {
          currentAddress: {
            street: "",
            city: "To be updated",
            state: "To be updated",
            pincode: "000000"
          }
        }
      });

      return res.status(201).json({
        success: true,
        data: profile.documents[0], // Return only the uploaded document
        message: 'Document uploaded successfully'
      });
    }

    // Add document to profile
    profile = await StudentProfile.findOneAndUpdate(
      { user: req.user.id },
      { 
        $push: { documents: documentData },
        updatedAt: Date.now() 
      },
      { new: true, runValidators: false }
    );

    // Update completion status
    await updateProfileCompletion(req.user.id);

    res.status(200).json({
      success: true,
      data: documentData, // Return only the uploaded document
      message: 'Document uploaded successfully'
    });
  } catch (error) {
    console.error('Error in uploadDocuments:', error);
    return next(new ErrorResponse(error.message || 'Error uploading document', 500));
  }
});

// @desc    Get all user details including profile and account information
// @route   GET /api/student/details
// @access  Private (Student)
exports.getUserDetails = asyncHandler(async (req, res, next) => {
  try {
    // Find user account details (excluding password)
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }
    
    // Find student profile
    const profile = await StudentProfile.findOne({ user: req.user.id });
    
    // Combine user account and profile data
    const userDetails = {
      account: user,
      profile: profile || null
    };
    
    res.status(200).json({
      success: true,
      data: userDetails
    });
  } catch (error) {
    console.error('Error in getUserDetails:', error);
    return next(new ErrorResponse(error.message || 'Error fetching user details', 500));
  }
});

// @desc    Delete document
// @route   DELETE /api/student/profile/documents/:id
// @access  Private (Student)
exports.deleteDocument = asyncHandler(async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.user.id });

    if (!profile) {
      return next(new ErrorResponse('Profile not found', 404));
    }

    // Find the document in the array
    const document = profile.documents?.find(
      doc => doc._id.toString() === req.params.id
    );

    if (!document) {
      return next(new ErrorResponse('Document not found', 404));
    }

    // Delete from cloudinary
    if (document.cloudinaryId) {
      await cloudinary.uploader.destroy(document.cloudinaryId);
    }

    // Remove document from array
    await StudentProfile.findOneAndUpdate(
      { user: req.user.id },
      { 
        $pull: { documents: { _id: req.params.id } },
        updatedAt: Date.now()
      }
    );

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteDocument:', error);
    return next(new ErrorResponse(error.message || 'Error deleting document', 500));
  }
}); 