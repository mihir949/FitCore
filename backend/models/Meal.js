const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  foodName: {
    type: String,
    required: true,
    trim: true
  },
  calories: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    default: 'breakfast'
  },
  image: {
    type: String,
    default: ''
  },
  quantity: {
    type: String,
    default: '1 serving'
  }
});

module.exports = mongoose.model('Meal', mealSchema);
