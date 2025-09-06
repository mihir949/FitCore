const mongoose = require('mongoose');

const waterSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  glasses: {
    type: Number,
    required: true,
    min: 0,
    max: 20
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Water', waterSchema);
