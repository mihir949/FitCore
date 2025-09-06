import React, { useState, useEffect } from 'react';
import { waterAPI } from '../utils/api';
import { 
  Droplets, 
  Plus, 
  Minus, 
  Target,
  TrendingUp,
  Calendar,
  CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const WaterTracker = () => {
  const [waterIntake, setWaterIntake] = useState({ glasses: 0, date: new Date() });
  const [loading, setLoading] = useState(true);
  const [weeklyData, setWeeklyData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const dailyGoal = 8; // 8 glasses per day
  const progressPercentage = Math.min((waterIntake.glasses / dailyGoal) * 100, 100);

  useEffect(() => {
    fetchTodayWater();
    fetchWeeklyData();
  }, [selectedDate]);

  const fetchTodayWater = async () => {
    try {
      setLoading(true);
      const response = await waterAPI.getTodayWater();
      setWaterIntake(response.data);
    } catch (error) {
      console.error('Error fetching water intake:', error);
      toast.error('Failed to load water intake');
    } finally {
      setLoading(false);
    }
  };

  const fetchWeeklyData = async () => {
    try {
      const response = await waterAPI.getWeeklyWater();
      setWeeklyData(response.data.weeklyData || []);
    } catch (error) {
      console.error('Error fetching weekly data:', error);
    }
  };

  const addGlass = async () => {
    if (waterIntake.glasses >= 20) {
      toast.error('Maximum 20 glasses per day');
      return;
    }

    try {
      const response = await waterAPI.addGlass();
      setWaterIntake(response.data);
      toast.success('Glass of water added!');
    } catch (error) {
      console.error('Error adding glass:', error);
      toast.error('Failed to add glass');
    }
  };

  const removeGlass = async () => {
    if (waterIntake.glasses <= 0) {
      toast.error('Cannot have negative glasses');
      return;
    }

    try {
      const newGlasses = Math.max(0, waterIntake.glasses - 1);
      const response = await waterAPI.addWaterIntake(newGlasses);
      setWaterIntake(response.data);
      toast.success('Glass of water removed');
    } catch (error) {
      console.error('Error removing glass:', error);
      toast.error('Failed to remove glass');
    }
  };

  const setCustomAmount = async (glasses) => {
    if (glasses < 0 || glasses > 20) {
      toast.error('Please enter a value between 0 and 20');
      return;
    }

    try {
      const response = await waterAPI.addWaterIntake(glasses);
      setWaterIntake(response.data);
      toast.success('Water intake updated!');
    } catch (error) {
      console.error('Error updating water intake:', error);
      toast.error('Failed to update water intake');
    }
  };

  const getWaterGlassIcon = (index) => {
    if (index < waterIntake.glasses) {
      return '💧'; // Filled glass
    }
    return '🥤'; // Empty glass
  };

  const getMotivationalMessage = () => {
    const glasses = waterIntake.glasses;
    if (glasses === 0) return "Start your hydration journey! 💧";
    if (glasses < 4) return "Keep going! You're doing great! 🌟";
    if (glasses < 6) return "Halfway there! Stay hydrated! 💪";
    if (glasses < 8) return "Almost at your goal! 🎯";
    if (glasses === 8) return "Perfect! You've reached your daily goal! 🎉";
    if (glasses < 12) return "Excellent! You're going above and beyond! 🚀";
    return "Hydration champion! You're amazing! 🏆";
  };

  const getWeeklyAverage = () => {
    if (weeklyData.length === 0) return 0;
    const total = weeklyData.reduce((sum, day) => sum + day.glasses, 0);
    return Math.round(total / weeklyData.length * 10) / 10;
  };

  const getWeeklyTotal = () => {
    return weeklyData.reduce((sum, day) => sum + day.glasses, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-black p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Water Tracker</h1>
          <p className="text-text-gray">Stay hydrated and track your daily water intake</p>
        </div>

        {/* Date Selector */}
        <div className="card mb-8">
          <div className="flex items-center justify-center space-x-4">
            <Calendar className="w-5 h-5 text-accent-blue" />
            <label className="text-text-white font-medium">Select Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input-field w-auto"
            />
          </div>
        </div>

        {/* Main Water Tracker */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Water Glass Display */}
          <div className="card">
            <h3 className="text-xl font-semibold text-white mb-6 text-center">
              Today's Water Intake
            </h3>
            
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-text-gray text-sm">Progress</span>
                <span className="text-accent-blue font-medium">
                  {waterIntake.glasses}/{dailyGoal} glasses
                </span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <div className="text-center mt-2">
                <span className="text-2xl font-bold text-accent-blue">
                  {Math.round(progressPercentage)}%
                </span>
              </div>
            </div>

            {/* Water Glasses Grid */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              {Array.from({ length: 20 }, (_, index) => (
                <div
                  key={index}
                  className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl transition-all duration-300 ${
                    index < waterIntake.glasses
                      ? 'bg-accent-blue/20 border-2 border-accent-blue animate-bounce-gentle'
                      : 'bg-primary-dark-light border-2 border-primary-dark-lighter'
                  }`}
                >
                  {getWaterGlassIcon(index)}
                </div>
              ))}
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-center space-x-4 mb-6">
              <button
                onClick={removeGlass}
                disabled={waterIntake.glasses <= 0}
                className="w-12 h-12 bg-red-500/20 hover:bg-red-500/30 disabled:bg-primary-dark-light disabled:text-text-gray text-red-500 rounded-lg flex items-center justify-center transition-all duration-300"
              >
                <Minus className="w-6 h-6" />
              </button>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">
                  {waterIntake.glasses}
                </div>
                <div className="text-text-gray text-sm">glasses</div>
              </div>
              
              <button
                onClick={addGlass}
                disabled={waterIntake.glasses >= 20}
                className="w-12 h-12 bg-accent-blue/20 hover:bg-accent-blue/30 disabled:bg-primary-dark-light disabled:text-text-gray text-accent-blue rounded-lg flex items-center justify-center transition-all duration-300"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>

            {/* Motivational Message */}
            <div className="text-center p-4 bg-primary-dark-light rounded-lg">
              <p className="text-text-white font-medium">{getMotivationalMessage()}</p>
            </div>
          </div>

          {/* Quick Actions & Stats */}
          <div className="space-y-6">
            {/* Quick Add Buttons */}
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Add</h3>
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 4, 6].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setCustomAmount(waterIntake.glasses + amount)}
                    disabled={waterIntake.glasses + amount > 20}
                    className="btn-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    +{amount} glasses
                  </button>
                ))}
              </div>
            </div>

            {/* Daily Stats */}
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2 text-accent-green" />
                Daily Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-text-gray">Goal Progress</span>
                  <span className="text-white font-medium">
                    {waterIntake.glasses}/{dailyGoal}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-gray">Remaining</span>
                  <span className="text-white font-medium">
                    {Math.max(0, dailyGoal - waterIntake.glasses)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-gray">Status</span>
                  <span className={`font-medium ${
                    waterIntake.glasses >= dailyGoal ? 'text-accent-green' : 'text-accent-blue'
                  }`}>
                    {waterIntake.glasses >= dailyGoal ? 'Goal Reached!' : 'Keep Going!'}
                  </span>
                </div>
              </div>
            </div>

            {/* Weekly Overview */}
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-accent-blue" />
                Weekly Overview
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-text-gray">Average per day</span>
                  <span className="text-white font-medium">{getWeeklyAverage()} glasses</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-gray">Total this week</span>
                  <span className="text-white font-medium">{getWeeklyTotal()} glasses</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-gray">Days tracked</span>
                  <span className="text-white font-medium">{weeklyData.length} days</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Chart */}
        <div className="card">
          <h3 className="text-xl font-semibold text-white mb-6">Weekly Water Intake</h3>
          {weeklyData.length > 0 ? (
            <div className="space-y-4">
              {weeklyData.map((day, index) => {
                const dayProgress = (day.glasses / dailyGoal) * 100;
                const dayName = new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' });
                const isToday = new Date(day.date).toDateString() === new Date().toDateString();
                
                return (
                  <div key={index} className={`p-4 rounded-lg ${
                    isToday ? 'bg-accent-blue/10 border border-accent-blue/30' : 'bg-primary-dark-light'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">{dayName}</span>
                      <span className="text-accent-blue font-medium">
                        {day.glasses} glasses
                      </span>
                    </div>
                    <div className="progress-bar h-2">
                      <div 
                        className="progress-fill h-2"
                        style={{ width: `${Math.min(dayProgress, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-text-gray text-sm">
                        {Math.round(dayProgress)}% of goal
                      </span>
                      {day.glasses >= dailyGoal && (
                        <CheckCircle className="w-4 h-4 text-accent-green" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Droplets className="w-12 h-12 text-text-gray mx-auto mb-4" />
              <p className="text-text-gray">No water intake data for this week</p>
            </div>
          )}
        </div>

        {/* Hydration Tips */}
        <div className="card mt-8">
          <h3 className="text-xl font-semibold text-white mb-4">💡 Hydration Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-primary-dark-light rounded-lg">
              <h4 className="text-white font-medium mb-2">Morning Routine</h4>
              <p className="text-text-gray text-sm">Start your day with a glass of water to kickstart your metabolism.</p>
            </div>
            <div className="p-4 bg-primary-dark-light rounded-lg">
              <h4 className="text-white font-medium mb-2">Before Meals</h4>
              <p className="text-text-gray text-sm">Drink water 30 minutes before meals to aid digestion.</p>
            </div>
            <div className="p-4 bg-primary-dark-light rounded-lg">
              <h4 className="text-white font-medium mb-2">During Exercise</h4>
              <p className="text-text-gray text-sm">Stay hydrated during workouts to maintain performance.</p>
            </div>
            <div className="p-4 bg-primary-dark-light rounded-lg">
              <h4 className="text-white font-medium mb-2">Evening Wind-down</h4>
              <p className="text-text-gray text-sm">Finish your water intake 2 hours before bedtime.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaterTracker;
