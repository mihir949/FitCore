const express = require('express');
const { body, validationResult } = require('express-validator');
const Workout = require('../models/Workout');
const Streak = require('../models/Streak');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all workouts for a user
router.get('/', auth, async (req, res) => {
  try {
    const workouts = await Workout.find({ userId: req.user._id })
      .sort({ date: -1 })
      .limit(50);
    
    res.json(workouts);
  } catch (error) {
    console.error('Get workouts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get workouts by date range
router.get('/range', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    const workouts = await Workout.find({
      userId: req.user._id,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).sort({ date: -1 });

    res.json(workouts);
  } catch (error) {
    console.error('Get workouts by range error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new workout
router.post('/', auth, [
  body('type').notEmpty().withMessage('Workout type is required'),
  body('duration').isNumeric().withMessage('Duration must be a number'),
  body('calories').isNumeric().withMessage('Calories must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, duration, calories, image, notes } = req.body;

    const workout = new Workout({
      userId: req.user._id,
      type,
      duration,
      calories,
      image: image || '',
      notes: notes || ''
    });

    await workout.save();

    // Update workout streak
    await updateWorkoutStreak(req.user._id);

    res.status(201).json(workout);
  } catch (error) {
    console.error('Add workout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update workout
router.put('/:id', auth, async (req, res) => {
  try {
    const { type, duration, calories, image, notes } = req.body;

    const workout = await Workout.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { type, duration, calories, image, notes },
      { new: true }
    );

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    res.json(workout);
  } catch (error) {
    console.error('Update workout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete workout
router.delete('/:id', auth, async (req, res) => {
  try {
    const workout = await Workout.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    res.json({ message: 'Workout deleted successfully' });
  } catch (error) {
    console.error('Delete workout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to update workout streak
async function updateWorkoutStreak(userId) {
  try {
    let streak = await Streak.findOne({ userId });
    
    if (!streak) {
      streak = new Streak({ userId });
    }

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if user worked out today
    const todayWorkout = await Workout.findOne({
      userId,
      date: {
        $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
      }
    });

    if (todayWorkout) {
      // If last workout was yesterday, increment streak
      if (streak.lastWorkoutDate && 
          streak.lastWorkoutDate.toDateString() === yesterday.toDateString()) {
        streak.workoutStreak += 1;
      } else if (!streak.lastWorkoutDate || 
                 streak.lastWorkoutDate.toDateString() !== today.toDateString()) {
        // If no workout yesterday, reset streak to 1
        streak.workoutStreak = 1;
      }
      
      streak.lastWorkoutDate = today;
      await streak.save();
    }
  } catch (error) {
    console.error('Update workout streak error:', error);
  }
}

module.exports = router;
