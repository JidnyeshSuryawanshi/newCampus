const Mess = require('../Models/mess');
const fs = require('fs');
const path = require('path');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

// @desc    Create a new mess
// @route   POST /api/mess
// @access  Private (messOwner only)
exports.createMess = async (req, res) => {
  try {
    // Add owner to req.body
    req.body.owner = req.user.id;
    
    // Process uploaded images
    const imageUploadPromises = [];
    
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadPromise = uploadToCloudinary(file.path, 'mess');
        imageUploadPromises.push(uploadPromise);
      }
    }
    
    // Parse weeklyMenu from JSON string if it exists
    if (req.body.weeklyMenu) {
      req.body.weeklyMenu = JSON.parse(req.body.weeklyMenu);
    }
    
    // Parse amenities from JSON string
    if (req.body.amenities) {
      req.body.amenities = JSON.parse(req.body.amenities);
    }
    
    // Wait for all images to upload
    const uploadedImages = await Promise.all(imageUploadPromises);
    
    // Add images to req.body
    req.body.images = uploadedImages;
    
    // Create mess
    const mess = await Mess.create(req.body);
    
    // Clean up temporary files
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        fs.unlinkSync(file.path);
      }
    }
    
    res.status(201).json({
      success: true,
      data: mess
    });
    
  } catch (error) {
    console.error('Create mess error:', error);
    
    // Clean up temporary files if they exist
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages[0]
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server error. Could not create mess.'
    });
  }
};

// @desc    Get all mess listings
// @route   GET /api/mess
// @access  Public
exports.getAllMess = async (req, res) => {
  try {
    // Build query
    let query = {};
    
    // Filter by availability if specified
    if (req.query.available === 'true') {
      query.availability = true;
    }
    
    // Filter by mess type if specified
    if (req.query.messType && ['veg', 'nonVeg', 'both'].includes(req.query.messType)) {
      query.messType = req.query.messType;
    }
    
    // Filter by price range if specified
    if (req.query.minPrice && req.query.maxPrice) {
      query.monthlyPrice = { 
        $gte: parseInt(req.query.minPrice), 
        $lte: parseInt(req.query.maxPrice) 
      };
    } else if (req.query.minPrice) {
      query.monthlyPrice = { $gte: parseInt(req.query.minPrice) };
    } else if (req.query.maxPrice) {
      query.monthlyPrice = { $lte: parseInt(req.query.maxPrice) };
    }
    
    // Execute query
    const messListings = await Mess.find(query)
      .populate({
        path: 'owner',
        select: 'username email'
      })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: messListings.length,
      data: messListings
    });
    
  } catch (error) {
    console.error('Get all mess error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error. Could not fetch mess listings.'
    });
  }
};

// @desc    Get mess listings for a specific owner
// @route   GET /api/mess/owner
// @access  Private (owner only)
exports.getOwnerMess = async (req, res) => {
  try {
    const messListings = await Mess.find({ owner: req.user.id })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: messListings.length,
      data: messListings
    });
    
  } catch (error) {
    console.error('Get owner mess error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error. Could not fetch your mess listings.'
    });
  }
};

// @desc    Get single mess
// @route   GET /api/mess/:id
// @access  Public
exports.getMess = async (req, res) => {
  try {
    const mess = await Mess.findById(req.params.id)
      .populate({
        path: 'owner',
        select: 'username email'
      });
    
    if (!mess) {
      return res.status(404).json({
        success: false,
        error: 'Mess not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: mess
    });
    
  } catch (error) {
    console.error('Get mess error:', error);
    
    // Handle invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Mess not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server error. Could not fetch mess.'
    });
  }
};

// @desc    Update mess
// @route   PUT /api/mess/:id
// @access  Private (owner only)
exports.updateMess = async (req, res) => {
  try {
    let mess = await Mess.findById(req.params.id);
    
    if (!mess) {
      return res.status(404).json({
        success: false,
        error: 'Mess not found'
      });
    }
    
    // Make sure user is the owner
    if (mess.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this mess'
      });
    }
    
    // Parse weeklyMenu from JSON string if it exists
    if (req.body.weeklyMenu) {
      req.body.weeklyMenu = JSON.parse(req.body.weeklyMenu);
    }
    
    // Parse amenities from JSON string
    if (req.body.amenities) {
      req.body.amenities = JSON.parse(req.body.amenities);
    }
    
    // Process uploaded images if any
    if (req.files && req.files.length > 0) {
      const imageUploadPromises = [];
      
      for (const file of req.files) {
        const uploadPromise = uploadToCloudinary(file.path, 'mess');
        imageUploadPromises.push(uploadPromise);
      }
      
      // Wait for all images to upload
      const uploadedImages = await Promise.all(imageUploadPromises);
      
      // Handle existing images
      if (req.body.existingImages) {
        const existingImages = JSON.parse(req.body.existingImages);
        req.body.images = [...existingImages, ...uploadedImages];
      } else {
        req.body.images = [...mess.images, ...uploadedImages];
      }
      
      // Clean up temporary files
      for (const file of req.files) {
        fs.unlinkSync(file.path);
      }
    }
    
    // Update mess
    mess = await Mess.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    res.status(200).json({
      success: true,
      data: mess
    });
    
  } catch (error) {
    console.error('Update mess error:', error);
    
    // Clean up temporary files if they exist
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages[0]
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server error. Could not update mess.'
    });
  }
};

// @desc    Delete mess
// @route   DELETE /api/mess/:id
// @access  Private (owner only)
exports.deleteMess = async (req, res) => {
  try {
    const mess = await Mess.findById(req.params.id);
    
    if (!mess) {
      return res.status(404).json({
        success: false,
        error: 'Mess not found'
      });
    }
    
    // Make sure user is the owner
    if (mess.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this mess'
      });
    }
    
    // Delete images from Cloudinary
    if (mess.images && mess.images.length > 0) {
      for (const image of mess.images) {
        await deleteFromCloudinary(image.public_id);
      }
    }
    
    // Delete mess
    await Mess.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      data: {}
    });
    
  } catch (error) {
    console.error('Delete mess error:', error);
    
    // Handle invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Mess not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server error. Could not delete mess.'
    });
  }
};

// @desc    Delete image from mess
// @route   DELETE /api/mess/:id/images/:imageId
// @access  Private (owner only)
exports.deleteMessImage = async (req, res) => {
  try {
    const mess = await Mess.findById(req.params.id);
    
    if (!mess) {
      return res.status(404).json({
        success: false,
        error: 'Mess not found'
      });
    }
    
    // Make sure user is the owner
    if (mess.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete images from this mess'
      });
    }
    
    // Find the image
    const imageIndex = mess.images.findIndex(
      image => image.public_id === req.params.imageId
    );
    
    if (imageIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Image not found'
      });
    }
    
    // Delete from Cloudinary
    await deleteFromCloudinary(mess.images[imageIndex].public_id);
    
    // Remove from mess
    mess.images.splice(imageIndex, 1);
    await mess.save();
    
    res.status(200).json({
      success: true,
      data: mess
    });
    
  } catch (error) {
    console.error('Delete mess image error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error. Could not delete image.'
    });
  }
};

// @desc    Get all mess services for student dashboard
// @route   GET /api/mess/student-dashboard
// @access  Private (student)
exports.getMessServicesForStudents = async (req, res) => {
  try {
    // Build query for available mess services only
    const query = { availability: true };
    
    // Apply additional filters if provided
    if (req.query.mealType && ['veg', 'non-veg', 'both'].includes(req.query.mealType)) {
      query.mealType = req.query.mealType;
    }
    
    if (req.query.location) {
      query.location = { $regex: req.query.location, $options: 'i' };
    }
    
    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      query.monthlySubscription = {};
      
      if (req.query.minPrice) {
        query.monthlySubscription.$gte = Number(req.query.minPrice);
      }
      
      if (req.query.maxPrice) {
        query.monthlySubscription.$lte = Number(req.query.maxPrice);
      }
    }
    
    // Execute query with full details
    const messServices = await Mess.find(query)
      .populate({
        path: 'owner',
        select: 'username email userType phone'
      })
      .sort({ createdAt: -1 });
    
    // Format response for student dashboard
    const formattedMessServices = messServices.map(mess => {
      return {
        id: mess._id,
        name: mess.name,
        description: mess.description,
        mealType: mess.mealType,
        monthlySubscription: mess.monthlySubscription,
        location: mess.location,
        weeklyMenu: mess.weeklyMenu || {},
        images: mess.images || [],
        availability: mess.availability,
        capacity: mess.capacity,
        currentSubscribers: mess.currentSubscribers,
        owner: mess.owner,
        rating: mess.averageRating || 0,
        reviewCount: mess.reviewCount || 0,
        createdAt: mess.createdAt
      };
    });
    
    res.status(200).json({
      success: true,
      count: formattedMessServices.length,
      data: formattedMessServices
    });
    
  } catch (error) {
    console.error('Get mess services for students error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error. Could not fetch mess services.'
    });
  }
};
