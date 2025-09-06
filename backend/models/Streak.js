const mongoose = require('mongoose');

const streakSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  workoutStreak: {
    type: Number,
    default: 0
  },
  waterStreak: {
    type: Number,
    default: 0
  },
  dietStreak: {
    type: Number,
    default: 0
  },
  badges: [{
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    },
    earnedDate: {
      type: Date,
      default: Date.now
    }
  }],
  lastWorkoutDate: {
    type: Date,
    default: null
  },
  lastWaterDate: {
    type: Date,
    default: null
  },
  lastDietDate: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.model('Streak', streakSchema);
