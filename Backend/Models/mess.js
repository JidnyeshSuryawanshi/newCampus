const mongoose = require('mongoose');

// Menu schema for each day of the week
const menuSchema = new mongoose.Schema({
  breakfast: {
    type: String,
    trim: true
  },
  lunch: {
    type: String,
    trim: true
  },
  dinner: {
    type: String,
    trim: true
  },
  snacks: {
    type: String,
    trim: true
  }
});

// Mess schema
const messSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Mess must have an owner']
  },
  messName: {
    type: String,
    required: [true, 'Please provide a mess name'],
    trim: true,
    maxlength: [100, 'Mess name cannot be more than 100 characters']
  },
  messType: {
    type: String,
    required: [true, 'Please specify mess type'],
    enum: {
      values: ['veg', 'nonVeg', 'both'],
      message: 'Mess type must be veg, nonVeg, or both'
    }
  },
  monthlyPrice: {
    type: Number,
    required: [true, 'Please provide monthly subscription price']
  },
  dailyPrice: {
    type: Number,
    required: [true, 'Please provide daily meal price']
  },
  capacity: {
    type: String,
    required: [true, 'Please specify capacity'],
    enum: {
      values: ['10', '20', '30', '40', '50+'],
      message: 'Capacity must be one of the predefined values'
    }
  },
  openingHours: {
    type: String,
    required: [true, 'Please provide opening hours'],
    trim: true
  },
  amenities: {
    acSeating: {
      type: Boolean,
      default: false
    },
    wifi: {
      type: Boolean,
      default: false
    },
    parking: {
      type: Boolean,
      default: false
    },
    homeDelivery: {
      type: Boolean,
      default: false
    },
    specialDiet: {
      type: Boolean,
      default: false
    }
  },
  weeklyMenu: {
    monday: menuSchema,
    tuesday: menuSchema,
    wednesday: menuSchema,
    thursday: menuSchema,
    friday: menuSchema,
    saturday: menuSchema,
    sunday: menuSchema
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
    required: [true, 'Please provide the mess address'],
    trim: true
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

module.exports = mongoose.model('Mess', messSchema);
