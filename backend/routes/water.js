const express = require('express');
const { body, validationResult } = require('express-validator');
const Water = require('../models/Water');
const Streak = require('../models/Streak');
const auth = require('../middleware/auth');

const router = express.Router();

// Get water intake for a user
router.get('/', auth, async (req, res) => {
  try {
    const waterIntake = await Water.find({ userId: req.user._id })
      .sort({ date: -1 })
      .limit(30);
    
    res.json(waterIntake);
  } catch (error) {
    console.error('Get water intake error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get water intake by date range
router.get('/range', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    const waterIntake = await Water.find({
      userId: req.user._id,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).sort({ date: -1 });

    res.json(waterIntake);
  } catch (error) {
    console.error('Get water intake by range error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get water intake for today
router.get('/today', auth, async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const todayWater = await Water.findOne({
      userId: req.user._id,
      date: {
        $gte: startOfDay,
        $lt: endOfDay
      }
    });

    res.json(todayWater || { glasses: 0, date: today });
  } catch (error) {
    console.error('Get today water intake error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add or update water intake
router.post('/', auth, [
  body('glasses').isInt({ min: 0, max: 20 }).withMessage('Glasses must be between 0 and 20')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { glasses } = req.body;
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Check if water intake already exists for today
    let waterIntake = await Water.findOne({
      userId: req.user._id,
      date: {
        $gte: startOfDay,
        $lt: endOfDay
      }
    });

    if (waterIntake) {
      // Update existing record
      waterIntake.glasses = glasses;
      await waterIntake.save();
    } else {
      // Create new record
      waterIntake = new Water({
        userId: req.user._id,
        glasses
      });
      await waterIntake.save();
    }

    // Update water streak
    await updateWaterStreak(req.user._id);

    res.json(waterIntake);
  } catch (error) {
    console.error('Add water intake error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add one glass of water
router.post('/add-glass', auth, async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Check if water intake already exists for today
    let waterIntake = await Water.findOne({
      userId: req.user._id,
      date: {
        $gte: startOfDay,
        $lt: endOfDay
      }
    });

    if (waterIntake) {
      // Increment existing record
      waterIntake.glasses = Math.min(waterIntake.glasses + 1, 20);
      await waterIntake.save();
    } else {
      // Create new record
      waterIntake = new Water({
        userId: req.user._id,
        glasses: 1
      });
      await waterIntake.save();
    }

    // Update water streak
    await updateWaterStreak(req.user._id);

    res.json(waterIntake);
  } catch (error) {
    console.error('Add glass of water error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get weekly water intake summary
router.get('/weekly', auth, async (req, res) => {
  try {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weeklyWater = await Water.find({
      userId: req.user._id,
      date: {
        $gte: weekAgo,
        $lte: today
      }
    }).sort({ date: 1 });

    const summary = {
      totalGlasses: weeklyWater.reduce((sum, water) => sum + water.glasses, 0),
      averageGlasses: weeklyWater.length > 0 ? 
        (weeklyWater.reduce((sum, water) => sum + water.glasses, 0) / weeklyWater.length).toFixed(1) : 0,
      daysWithWater: weeklyWater.length,
      weeklyData: weeklyWater
    };

    res.json(summary);
  } catch (error) {
    console.error('Get weekly water summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to update water streak
async function updateWaterStreak(userId) {
  try {
    let streak = await Streak.findOne({ userId });
    
    if (!streak) {
      streak = new Streak({ userId });
    }

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if user drank water today (at least 4 glasses)
    const todayWater = await Water.findOne({
      userId,
      date: {
        $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
      }
    });

    if (todayWater && todayWater.glasses >= 4) {
      // If last water log was yesterday, increment streak
      if (streak.lastWaterDate && 
          streak.lastWaterDate.toDateString() === yesterday.toDateString()) {
        streak.waterStreak += 1;
      } else if (!streak.lastWaterDate || 
                 streak.lastWaterDate.toDateString() !== today.toDateString()) {
        // If no water log yesterday, reset streak to 1
        streak.waterStreak = 1;
      }
      
      streak.lastWaterDate = today;
      await streak.save();
    }
  } catch (error) {
    console.error('Update water streak error:', error);
  }
}

module.exports = router;
