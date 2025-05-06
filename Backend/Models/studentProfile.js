const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  personalInfo: {
    fullName: {
      type: String,
      required: [true, 'Please provide your full name']
    },
    phoneNumber: {
      type: String,
      required: [true, 'Please provide a contact number'],
      match: [/^(\+\d{1,3}[- ]?)?\d{10}$/, 'Please provide a valid phone number']
    },
    dateOfBirth: {
      type: Date
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer not to say']
    },
    profilePicture: {
      public_id: String,
      url: String
    }
  },
  academicInfo: {
    institution: {
      type: String,
      required: [true, 'Please provide your institution name']
    },
    studentId: {
      type: String,
      required: [true, 'Please provide your student ID/roll number']
    },
    course: {
      type: String,
      required: [true, 'Please provide your course/program']
    },
    year: {
      type: String,
      enum: ['1st year', '2nd year', '3rd year', '4th year', '5th year', 'graduated']
    },
    graduationYear: {
      type: Number,
      min: [2000, 'Please provide a valid graduation year'],
      max: [2100, 'Please provide a valid graduation year']
    }
  },
  contactInfo: {
    currentAddress: {
      street: String,
      city: {
        type: String,
        required: [true, 'Please provide your city']
      },
      state: {
        type: String,
        required: [true, 'Please provide your state']
      },
      pincode: {
        type: String,
        required: [true, 'Please provide your pincode'],
        match: [/^\d{6}$/, 'Please provide a valid 6-digit pincode']
      }
    },
    permanentAddress: {
      street: String,
      city: String,
      state: String,
      pincode: String
    },
    emergencyContact: {
      name: String,
      relation: String,
      phoneNumber: String
    }
  },
  paymentInfo: {
    preferredPaymentMethods: [{
      type: String,
      enum: ['upi', 'card', 'netbanking', 'wallet']
    }],
    savedUpiIds: [String],
    savedCards: [{
      cardHolderName: String,
      lastFourDigits: String,
      expiryDate: String,
      network: {
        type: String,
        enum: ['visa', 'mastercard', 'rupay', 'other']
      }
    }]
  },
  preferences: {
    bookingReminders: {
      type: Boolean,
      default: true
    },
    emailNotifications: {
      type: Boolean,
      default: true
    },
    servicePreferences: {
      dietaryPreferences: [String],
      accommodationPreferences: [String],
      gymPreferences: [String]
    }
  },
  documents: [{
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['identity', 'address_proof', 'student_id', 'other'],
      default: 'other'
    },
    cloudinaryId: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    verified: {
      type: Boolean,
      default: false
    }
  }],
  isProfileComplete: {
    type: Boolean,
    default: false
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for faster queries
studentProfileSchema.index({ user: 1 });

module.exports = mongoose.model('StudentProfile', studentProfileSchema); 