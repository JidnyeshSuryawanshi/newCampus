const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a student']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Booking must have an owner']
  },
  serviceType: {
    type: String,
    enum: ['hostel', 'mess', 'gym'],
    required: [true, 'Service type is required']
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Service ID is required'],
    refPath: 'serviceType'
  },
  bookingDetails: {
    checkInDate: {
      type: Date,
      required: [function() {
        return this.serviceType === 'hostel';
      }, 'Check-in date is required for hostel bookings']
    },
    startDate: {
      type: Date,
      required: [function() {
        return this.serviceType === 'mess';
      }, 'Start date is required for mess subscriptions']
    },
    duration: {
      type: String,
      required: [true, 'Duration is required for all bookings']
    },
    additionalRequirements: {
      type: String,
      trim: true
    }
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'cancelled', 'terminated'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid'],
    default: 'unpaid'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware to update the updatedAt field on save
bookingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Booking', bookingSchema); 