const Gym = require('../Models/gym');
const fs = require('fs');
const path = require('path');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

// @desc    Create a new gym
// @route   POST /api/gym
// @access  Private (gymOwner only)
exports.createGym = async (req, res) => {
  try {
    // Add owner to req.body
    req.body.owner = req.user.id;
    
    // Process uploaded images
    const imageUploadPromises = [];
    
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadPromise = uploadToCloudinary(file.path, 'gym');
        imageUploadPromises.push(uploadPromise);
      }
    }
    
    // Parse equipment from JSON string
    if (req.body.equipment) {
      req.body.equipment = JSON.parse(req.body.equipment);
    }
    
    // Parse facilities from JSON string
    if (req.body.facilities) {
      req.body.facilities = JSON.parse(req.body.facilities);
    }
    
    // Parse membership plans from JSON string
    if (req.body.membershipPlans) {
      req.body.membershipPlans = JSON.parse(req.body.membershipPlans);
    }
    
    // Wait for all images to upload
    const uploadedImages = await Promise.all(imageUploadPromises);
    
    // Add images to req.body
    req.body.images = uploadedImages;
    
    // Create gym
    const gym = await Gym.create(req.body);
    
    // Clean up temporary files
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        fs.unlinkSync(file.path);
      }
    }
    
    res.status(201).json({
      success: true,
      data: gym
    });
    
  } catch (error) {
    console.error('Create gym error:', error);
    
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
      error: 'Server error. Could not create gym.'
    });
  }
};

// @desc    Get all gym listings
// @route   GET /api/gym
// @access  Public
exports.getAllGyms = async (req, res) => {
  try {
    // Build query
    let query = {};
    
    // Filter by availability if specified
    if (req.query.available === 'true') {
      query.availability = true;
    }
    
    // Filter by gym type if specified
    if (req.query.gymType && ['fitness', 'crossfit', 'yoga', 'cardio', 'weightlifting', 'mixed'].includes(req.query.gymType)) {
      query.gymType = req.query.gymType;
    }
    
    // Execute query
    const gymListings = await Gym.find(query)
      .populate({
        path: 'owner',
        select: 'username email'
      })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: gymListings.length,
      data: gymListings
    });
    
  } catch (error) {
    console.error('Get all gyms error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error. Could not fetch gym listings.'
    });
  }
};

// @desc    Get gym listings for a specific owner
// @route   GET /api/gym/owner
// @access  Private (owner only)
exports.getOwnerGyms = async (req, res) => {
  try {
    const gymListings = await Gym.find({ owner: req.user.id })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: gymListings.length,
      data: gymListings
    });
    
  } catch (error) {
    console.error('Get owner gyms error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error. Could not fetch your gym listings.'
    });
  }
};

// @desc    Get single gym
// @route   GET /api/gym/:id
// @access  Public
exports.getGym = async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.id)
      .populate({
        path: 'owner',
        select: 'username email'
      });
    
    if (!gym) {
      return res.status(404).json({
        success: false,
        error: 'Gym not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: gym
    });
    
  } catch (error) {
    console.error('Get gym error:', error);
    
    // Handle invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Gym not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server error. Could not fetch gym.'
    });
  }
};

// @desc    Update gym
// @route   PUT /api/gym/:id
// @access  Private (owner only)
exports.updateGym = async (req, res) => {
  try {
    let gym = await Gym.findById(req.params.id);
    
    if (!gym) {
      return res.status(404).json({
        success: false,
        error: 'Gym not found'
      });
    }
    
    // Make sure user is the owner
    if (gym.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this gym'
      });
    }
    
    // Parse equipment from JSON string
    if (req.body.equipment) {
      req.body.equipment = JSON.parse(req.body.equipment);
    }
    
    // Parse facilities from JSON string
    if (req.body.facilities) {
      req.body.facilities = JSON.parse(req.body.facilities);
    }
    
    // Parse membership plans from JSON string
    if (req.body.membershipPlans) {
      req.body.membershipPlans = JSON.parse(req.body.membershipPlans);
    }
    
    // Process uploaded images if any
    if (req.files && req.files.length > 0) {
      const imageUploadPromises = [];
      
      for (const file of req.files) {
        const uploadPromise = uploadToCloudinary(file.path, 'gym');
        imageUploadPromises.push(uploadPromise);
      }
      
      // Wait for all images to upload
      const uploadedImages = await Promise.all(imageUploadPromises);
      
      // Handle existing images
      if (req.body.existingImages) {
        const existingImages = JSON.parse(req.body.existingImages);
        req.body.images = [...existingImages, ...uploadedImages];
      } else {
        req.body.images = [...gym.images, ...uploadedImages];
      }
      
      // Clean up temporary files
      for (const file of req.files) {
        fs.unlinkSync(file.path);
      }
    }
    
    // Update gym
    gym = await Gym.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    res.status(200).json({
      success: true,
      data: gym
    });
    
  } catch (error) {
    console.error('Update gym error:', error);
    
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
      error: 'Server error. Could not update gym.'
    });
  }
};

// @desc    Delete gym
// @route   DELETE /api/gym/:id
// @access  Private (owner only)
exports.deleteGym = async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.id);
    
    if (!gym) {
      return res.status(404).json({
        success: false,
        error: 'Gym not found'
      });
    }
    
    // Make sure user is the owner
    if (gym.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this gym'
      });
    }
    
    // Delete images from Cloudinary
    if (gym.images && gym.images.length > 0) {
      for (const image of gym.images) {
        await deleteFromCloudinary(image.public_id);
      }
    }
    
    // Delete gym
    await Gym.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      data: {}
    });
    
  } catch (error) {
    console.error('Delete gym error:', error);
    
    // Handle invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Gym not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server error. Could not delete gym.'
    });
  }
};

// @desc    Delete image from gym
// @route   DELETE /api/gym/:id/images/:imageId
// @access  Private (owner only)
exports.deleteGymImage = async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.id);
    
    if (!gym) {
      return res.status(404).json({
        success: false,
        error: 'Gym not found'
      });
    }
    
    // Make sure user is the owner
    if (gym.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete images from this gym'
      });
    }
    
    // Find the image
    const imageIndex = gym.images.findIndex(
      image => image.public_id === req.params.imageId
    );
    
    if (imageIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Image not found'
      });
    }
    
    // Delete from Cloudinary
    await deleteFromCloudinary(gym.images[imageIndex].public_id);
    
    // Remove from gym
    gym.images.splice(imageIndex, 1);
    await gym.save();
    
    res.status(200).json({
      success: true,
      data: gym
    });
    
  } catch (error) {
    console.error('Delete gym image error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error. Could not delete image.'
    });
  }
};

// @desc    Get all gym services for student dashboard
// @route   GET /api/gym/student-dashboard
// @access  Private (student)
exports.getGymServicesForStudents = async (req, res) => {
  try {
    // Build query for available gym services only
    const query = { availability: true };
    
    // Apply additional filters if provided
    if (req.query.gender && ['male', 'female', 'coed'].includes(req.query.gender)) {
      query.gender = req.query.gender;
    }
    
    if (req.query.location) {
      query.location = { $regex: req.query.location, $options: 'i' };
    }
    
    // Price range filter for different subscriptions
    if (req.query.minPrice || req.query.maxPrice) {
      query.$or = [];
      
      const priceFilter = {};
      if (req.query.minPrice) {
        priceFilter.$gte = Number(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        priceFilter.$lte = Number(req.query.maxPrice);
      }
      
      // Apply to all subscription types
      if (Object.keys(priceFilter).length > 0) {
        query.$or.push({ 'monthly': priceFilter });
        query.$or.push({ 'quarterly': priceFilter });
        query.$or.push({ 'halfYearly': priceFilter });
        query.$or.push({ 'yearly': priceFilter });
      }
    }
    
    // Execute query with full details
    const gymServices = await Gym.find(query)
      .populate({
        path: 'owner',
        select: 'username email userType phone'
      })
      .sort({ createdAt: -1 });
    
    // Format response for student dashboard
    const formattedGymServices = gymServices.map(gym => {
      return {
        id: gym._id,
        name: gym.name,
        description: gym.description,
        gender: gym.gender,
        location: gym.location,
        equipment: gym.equipment || {},
        facilities: gym.facilities || {},
        subscriptions: {
          monthly: gym.monthly,
          quarterly: gym.quarterly,
          halfYearly: gym.halfYearly,
          yearly: gym.yearly
        },
        workingHours: {
          opening: gym.openingTime,
          closing: gym.closingTime
        },
        images: gym.images || [],
        availability: gym.availability,
        capacity: gym.capacity,
        currentMembers: gym.currentMembers,
        owner: gym.owner,
        rating: gym.averageRating || 0,
        reviewCount: gym.reviewCount || 0,
        createdAt: gym.createdAt
      };
    });
    
    res.status(200).json({
      success: true,
      count: formattedGymServices.length,
      data: formattedGymServices
    });
    
  } catch (error) {
    console.error('Get gym services for students error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error. Could not fetch gym services.'
    });
  }
};
