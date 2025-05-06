const mongoose = require('mongoose');

// Membership plan schema
const membershipPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: String,
    required: true,
    enum: {
      values: ['daily', 'weekly', 'monthly', 'quarterly', 'halfYearly', 'yearly'],
      message: 'Duration must be one of the predefined values'
    }
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    trim: true
  }
});

// Gym schema
const gymSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Gym must have an owner']
  },
  gymName: {
    type: String,
    required: [true, 'Please provide a gym name'],
    trim: true,
    maxlength: [100, 'Gym name cannot be more than 100 characters']
  },
  gymType: {
    type: String,
    required: [true, 'Please specify gym type'],
    enum: {
      values: ['fitness', 'crossfit', 'yoga', 'cardio', 'weightlifting', 'mixed'],
      message: 'Gym type must be one of the predefined values'
    }
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
  equipment: {
    treadmill: {
      type: Boolean,
      default: false
    },
    crossTrainer: {
      type: Boolean,
      default: false
    },
    exerciseBike: {
      type: Boolean,
      default: false
    },
    rowingMachine: {
      type: Boolean,
      default: false
    },
    weights: {
      type: Boolean,
      default: false
    },
    benchPress: {
      type: Boolean,
      default: false
    },
    powerRack: {
      type: Boolean,
      default: false
    },
    smithMachine: {
      type: Boolean,
      default: false
    },
    cableMachine: {
      type: Boolean,
      default: false
    },
    legPress: {
      type: Boolean,
      default: false
    }
  },
  facilities: {
    airConditioned: {
      type: Boolean,
      default: false
    },
    parking: {
      type: Boolean,
      default: false
    },
    wifi: {
      type: Boolean,
      default: false
    },
    changingRoom: {
      type: Boolean,
      default: false
    },
    shower: {
      type: Boolean,
      default: false
    },
    locker: {
      type: Boolean,
      default: false
    },
    personalTrainer: {
      type: Boolean,
      default: false
    },
    nutritionCounseling: {
      type: Boolean,
      default: false
    },
    supplements: {
      type: Boolean,
      default: false
    }
  },
  membershipPlans: [membershipPlanSchema],
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
    required: [true, 'Please provide the gym address'],
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

module.exports = mongoose.model('Gym', gymSchema);
