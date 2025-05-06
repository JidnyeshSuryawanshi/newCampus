const mongoose = require('mongoose');

const ownerProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  personalInfo: {
    fullName: {
      type: String
    },
    phoneNumber: {
      type: String,
      match: [/^(\+\d{1,3}[- ]?)?\d{10}$/, 'Please provide a valid phone number']
    },
    alternatePhone: {
      type: String,
      match: [/^(\+\d{1,3}[- ]?)?\d{10}$/, 'Please provide a valid phone number']
    },
    profileImage: {
      public_id: String,
      url: String
    }
  },
  businessInfo: {
    businessName: {
      type: String
    },
    businessType: {
      type: String,
      enum: {
        values: ['hostel', 'mess', 'gym', 'other'],
        message: 'Please select a valid business type'
      }
    },
    gstNumber: {
      type: String
    },
    businessAddress: {
      type: String
    },
    establishmentYear: {
      type: String
    }
  },
  preferences: {
    bookingPreferences: {
      autoAcceptBookings: {
        type: Boolean,
        default: false
      },
      minimumStayDuration: {
        type: String,
        default: '1'
      },
      advanceBookingDays: {
        type: String,
        default: '7'
      },
      instantPaymentRequired: {
        type: Boolean,
        default: false
      }
    },
    notificationSettings: {
      emailNotifications: {
        type: Boolean,
        default: true
      },
      smsNotifications: {
        type: Boolean,
        default: false
      },
      bookingAlerts: {
        type: Boolean,
        default: true
      },
      paymentAlerts: {
        type: Boolean,
        default: true
      },
      marketingUpdates: {
        type: Boolean,
        default: false
      }
    },
    displaySettings: {
      showContactInfo: {
        type: Boolean,
        default: true
      },
      showPricing: {
        type: Boolean,
        default: true
      },
      featuredListing: {
        type: Boolean,
        default: false
      }
    }
  },
  documents: [{
    documentType: {
      type: String,
      enum: ['businessLicense', 'identityProof', 'addressProof', 'taxDocument', 'propertyDocument', 'other']
    },
    name: {
      type: String
    },
    documentUrl: {
      type: String
    },
    cloudinaryId: {
      type: String
    },
    uploadDate: {
      type: Date,
      default: Date.now
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending'
    },
    rejectionReason: {
      type: String
    }
  }],
  isProfileComplete: {
    type: Boolean,
    default: false
  },
  completionPercentage: {
    type: Number,
    default: 0
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for faster queries
ownerProfileSchema.index({ user: 1 });

module.exports = mongoose.model('OwnerProfile', ownerProfileSchema);
