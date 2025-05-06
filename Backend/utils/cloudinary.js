const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload file to Cloudinary
const uploadToCloudinary = async (filePath, folder = 'hostel_rooms') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'auto'
    });
    return {
      public_id: result.public_id,
      url: result.secure_url
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Error uploading image to Cloudinary');
  }
};

// Delete file from Cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    return { success: true };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Error deleting image from Cloudinary');
  }
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary
};
