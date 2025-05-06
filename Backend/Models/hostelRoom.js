const mongoose = require('mongoose');

const hostelRoomSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Room must belong to a hostel owner']
  },
  roomName: {
    type: String,
    required: [true, 'Please provide a room name'],
    trim: true
  },
  roomType: {
    type: String,
    required: [true, 'Please specify room type'],
    enum: {
      values: ['single', 'double', 'triple', 'dormitory', 'flat'],
      message: 'Please select a valid room type'
    }
  },
  price: {
    type: Number,
    required: [true, 'Please provide monthly rent']
  },
  capacity: {
    type: String,
    required: [true, 'Please specify capacity'],
    enum: {
      values: ['1', '2', '3', '4', '5+'],
      message: 'Please select a valid capacity'
    }
  },
  gender: {
    type: String,
    required: [true, 'Please specify gender preference'],
    enum: {
      values: ['any', 'male', 'female'],
      message: 'Please select a valid gender preference'
    }
  },
  amenities: {
    wifi: {
      type: Boolean,
      default: false
    },
    ac: {
      type: Boolean,
      default: false
    },
    tv: {
      type: Boolean,
      default: false
    },
    fridge: {
      type: Boolean,
      default: false
    },
    washingMachine: {
      type: Boolean,
      default: false
    },
    hotWater: {
      type: Boolean,
      default: false
    },
    parking: {
      type: Boolean,
      default: false
    },
    security: {
      type: Boolean,
      default: false
    },
    meals: {
      type: Boolean,
      default: false
    },
    cleaning: {
      type: Boolean,
      default: false
    }
  },
  images: [
    {
      public_id: {
        type: String,
        required: true
      },
      url: {
        type: String,
        required: true
      }
    }
  ],
  description: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Please provide the address']
  },
  rules: {
    type: String,
    trim: true
  },
  availability: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('HostelRoom', hostelRoomSchema);
