const express = require('express');
const { body, validationResult } = require('express-validator');
const Meal = require('../models/Meal');
const Streak = require('../models/Streak');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all meals for a user
router.get('/', auth, async (req, res) => {
  try {
    const meals = await Meal.find({ userId: req.user._id })
      .sort({ date: -1 })
      .limit(50);
    
    res.json(meals);
  } catch (error) {
    console.error('Get meals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get meals by date range
router.get('/range', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    const meals = await Meal.find({
      userId: req.user._id,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).sort({ date: -1 });

    res.json(meals);
  } catch (error) {
    console.error('Get meals by range error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get meals by date
router.get('/date/:date', auth, async (req, res) => {
  try {
    const date = new Date(req.params.date);
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

    const meals = await Meal.find({
      userId: req.user._id,
      date: {
        $gte: startOfDay,
        $lt: endOfDay
      }
    }).sort({ date: 1 });

    res.json(meals);
  } catch (error) {
    console.error('Get meals by date error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new meal
router.post('/', auth, [
  body('foodName').trim().notEmpty().withMessage('Food name is required'),
  body('calories').isNumeric().withMessage('Calories must be a number'),
  body('mealType').optional().isIn(['breakfast', 'lunch', 'dinner', 'snack'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { foodName, calories, mealType, image, quantity } = req.body;

    const meal = new Meal({
      userId: req.user._id,
      foodName,
      calories,
      mealType: mealType || 'breakfast',
      image: image || '',
      quantity: quantity || '1 serving'
    });

    await meal.save();

    // Update diet streak
    await updateDietStreak(req.user._id);

    res.status(201).json(meal);
  } catch (error) {
    console.error('Add meal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update meal
router.put('/:id', auth, async (req, res) => {
  try {
    const { foodName, calories, mealType, image, quantity } = req.body;

    const meal = await Meal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { foodName, calories, mealType, image, quantity },
      { new: true }
    );

    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    res.json(meal);
  } catch (error) {
    console.error('Update meal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete meal
router.delete('/:id', auth, async (req, res) => {
  try {
    const meal = await Meal.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    res.json({ message: 'Meal deleted successfully' });
  } catch (error) {
    console.error('Delete meal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get daily calorie summary
router.get('/summary/:date', auth, async (req, res) => {
  try {
    const date = new Date(req.params.date);
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

    const meals = await Meal.find({
      userId: req.user._id,
      date: {
        $gte: startOfDay,
        $lt: endOfDay
      }
    });

    const summary = {
      totalCalories: meals.reduce((sum, meal) => sum + meal.calories, 0),
      mealCount: meals.length,
      mealsByType: {
        breakfast: meals.filter(m => m.mealType === 'breakfast'),
        lunch: meals.filter(m => m.mealType === 'lunch'),
        dinner: meals.filter(m => m.mealType === 'dinner'),
        snack: meals.filter(m => m.mealType === 'snack')
      }
    };

    res.json(summary);
  } catch (error) {
    console.error('Get meal summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to update diet streak
async function updateDietStreak(userId) {
  try {
    let streak = await Streak.findOne({ userId });
    
    if (!streak) {
      streak = new Streak({ userId });
    }

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if user logged meals today
    const todayMeals = await Meal.find({
      userId,
      date: {
        $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
      }
    });

    if (todayMeals.length > 0) {
      // If last diet log was yesterday, increment streak
      if (streak.lastDietDate && 
          streak.lastDietDate.toDateString() === yesterday.toDateString()) {
        streak.dietStreak += 1;
      } else if (!streak.lastDietDate || 
                 streak.lastDietDate.toDateString() !== today.toDateString()) {
        // If no diet log yesterday, reset streak to 1
        streak.dietStreak = 1;
      }
      
      streak.lastDietDate = today;
      await streak.save();
    }
  } catch (error) {
    console.error('Update diet streak error:', error);
  }
}

module.exports = router;
