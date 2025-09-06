const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['cardio', 'strength', 'yoga', 'running', 'cycling', 'swimming', 'other']
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  calories: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  image: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  }
});

module.exports = mongoose.model('Workout', workoutSchema);
