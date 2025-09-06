const express = require('express');
const Streak = require('../models/Streak');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user streaks
router.get('/', auth, async (req, res) => {
  try {
    let streak = await Streak.findOne({ userId: req.user._id });
    
    if (!streak) {
      streak = new Streak({ userId: req.user._id });
      await streak.save();
    }

    res.json(streak);
  } catch (error) {
    console.error('Get streaks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update streaks manually (for testing or admin purposes)
router.put('/update', auth, async (req, res) => {
  try {
    const { workoutStreak, waterStreak, dietStreak } = req.body;

    let streak = await Streak.findOne({ userId: req.user._id });
    
    if (!streak) {
      streak = new Streak({ userId: req.user._id });
    }

    if (workoutStreak !== undefined) streak.workoutStreak = workoutStreak;
    if (waterStreak !== undefined) streak.waterStreak = waterStreak;
    if (dietStreak !== undefined) streak.dietStreak = dietStreak;

    await streak.save();

    res.json(streak);
  } catch (error) {
    console.error('Update streaks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add badge
router.post('/badge', auth, async (req, res) => {
  try {
    const { name, description, image } = req.body;

    if (!name || !description || !image) {
      return res.status(400).json({ message: 'Name, description, and image are required' });
    }

    let streak = await Streak.findOne({ userId: req.user._id });
    
    if (!streak) {
      streak = new Streak({ userId: req.user._id });
    }

    // Check if badge already exists
    const existingBadge = streak.badges.find(badge => badge.name === name);
    if (existingBadge) {
      return res.status(400).json({ message: 'Badge already exists' });
    }

    streak.badges.push({
      name,
      description,
      image,
      earnedDate: new Date()
    });

    await streak.save();

    res.json(streak);
  } catch (error) {
    console.error('Add badge error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get available badges (predefined badges)
router.get('/available-badges', auth, async (req, res) => {
  try {
    const availableBadges = [
      {
        name: 'First Workout',
        description: 'Complete your first workout',
        image: '/images/badges/first-workout.png',
        requirement: { type: 'workout', count: 1 }
      },
      {
        name: 'Week Warrior',
        description: 'Work out for 7 consecutive days',
        image: '/images/badges/week-warrior.png',
        requirement: { type: 'workout_streak', count: 7 }
      },
      {
        name: 'Hydration Hero',
        description: 'Drink 8+ glasses of water for 7 days',
        image: '/images/badges/hydration-hero.png',
        requirement: { type: 'water_streak', count: 7 }
      },
      {
        name: 'Meal Master',
        description: 'Log meals for 14 consecutive days',
        image: '/images/badges/meal-master.png',
        requirement: { type: 'diet_streak', count: 14 }
      },
      {
        name: 'Fitness Fanatic',
        description: 'Work out for 30 consecutive days',
        image: '/images/badges/fitness-fanatic.png',
        requirement: { type: 'workout_streak', count: 30 }
      },
      {
        name: 'Calorie Counter',
        description: 'Log 100 meals',
        image: '/images/badges/calorie-counter.png',
        requirement: { type: 'meal_count', count: 100 }
      }
    ];

    res.json(availableBadges);
  } catch (error) {
    console.error('Get available badges error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check and award badges
router.post('/check-badges', auth, async (req, res) => {
  try {
    const streak = await Streak.findOne({ userId: req.user._id });
    
    if (!streak) {
      return res.json({ message: 'No streaks found' });
    }

    const newBadges = [];
    
    // Check for workout streak badges
    if (streak.workoutStreak >= 7 && !streak.badges.find(b => b.name === 'Week Warrior')) {
      streak.badges.push({
        name: 'Week Warrior',
        description: 'Work out for 7 consecutive days',
        image: '/images/badges/week-warrior.png',
        earnedDate: new Date()
      });
      newBadges.push('Week Warrior');
    }

    if (streak.workoutStreak >= 30 && !streak.badges.find(b => b.name === 'Fitness Fanatic')) {
      streak.badges.push({
        name: 'Fitness Fanatic',
        description: 'Work out for 30 consecutive days',
        image: '/images/badges/fitness-fanatic.png',
        earnedDate: new Date()
      });
      newBadges.push('Fitness Fanatic');
    }

    // Check for water streak badges
    if (streak.waterStreak >= 7 && !streak.badges.find(b => b.name === 'Hydration Hero')) {
      streak.badges.push({
        name: 'Hydration Hero',
        description: 'Drink 8+ glasses of water for 7 days',
        image: '/images/badges/hydration-hero.png',
        earnedDate: new Date()
      });
      newBadges.push('Hydration Hero');
    }

    // Check for diet streak badges
    if (streak.dietStreak >= 14 && !streak.badges.find(b => b.name === 'Meal Master')) {
      streak.badges.push({
        name: 'Meal Master',
        description: 'Log meals for 14 consecutive days',
        image: '/images/badges/meal-master.png',
        earnedDate: new Date()
      });
      newBadges.push('Meal Master');
    }

    if (newBadges.length > 0) {
      await streak.save();
    }

    res.json({
      newBadges,
      streak
    });
  } catch (error) {
    console.error('Check badges error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
