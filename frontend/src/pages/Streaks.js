import React, { useState, useEffect } from 'react';
import { streakAPI } from '../utils/api';
import { 
  Trophy, 
  Flame, 
  Droplets, 
  Utensils, 
  Target,
  Star,
  Award,
  Calendar,
  TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';

const Streaks = () => {
  const [streaks, setStreaks] = useState(null);
  const [availableBadges, setAvailableBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStreaks();
    fetchAvailableBadges();
  }, []);

  const fetchStreaks = async () => {
    try {
      setLoading(true);
      const response = await streakAPI.getStreaks();
      setStreaks(response.data);
    } catch (error) {
      console.error('Error fetching streaks:', error);
      toast.error('Failed to load streaks');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableBadges = async () => {
    try {
      const response = await streakAPI.getAvailableBadges();
      setAvailableBadges(response.data);
    } catch (error) {
      console.error('Error fetching available badges:', error);
    }
  };

  const checkForNewBadges = async () => {
    try {
      const response = await streakAPI.checkBadges();
      if (response.data.newBadges.length > 0) {
        toast.success(`Congratulations! You earned ${response.data.newBadges.length} new badge(s)!`);
        setStreaks(response.data.streak);
      }
    } catch (error) {
      console.error('Error checking badges:', error);
    }
  };

  const getStreakEmoji = (type) => {
    switch (type) {
      case 'workout': return '💪';
      case 'water': return '💧';
      case 'diet': return '🍎';
      default: return '🔥';
    }
  };

  const getStreakColor = (type) => {
    switch (type) {
      case 'workout': return 'accent-blue';
      case 'water': return 'accent-blue';
      case 'diet': return 'accent-green';
      default: return 'accent-green';
    }
  };

  const getStreakIcon = (type) => {
    switch (type) {
      case 'workout': return Flame;
      case 'water': return Droplets;
      case 'diet': return Utensils;
      default: return Trophy;
    }
  };

  const getMotivationalMessage = (streakCount, type) => {
    if (streakCount === 0) {
      return `Start your ${type} streak today!`;
    } else if (streakCount < 3) {
      return `Great start! Keep building that ${type} streak!`;
    } else if (streakCount < 7) {
      return `Amazing! You're building a solid ${type} habit!`;
    } else if (streakCount < 14) {
      return `Incredible! You're becoming a ${type} champion!`;
    } else if (streakCount < 30) {
      return `Outstanding! You're a ${type} master!`;
    } else {
      return `Legendary! You're a ${type} legend!`;
    }
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Streaks & Badges</h1>
          <p className="text-text-gray">Track your progress and celebrate your achievements</p>
        </div>

        {/* Check for New Badges Button */}
        <div className="text-center mb-8">
          <button
            onClick={checkForNewBadges}
            className="btn-primary flex items-center space-x-2 mx-auto"
          >
            <Award className="w-5 h-5" />
            <span>Check for New Badges</span>
          </button>
        </div>

        {/* Current Streaks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Workout Streak */}
          <div className="card card-hover">
            <div className="text-center">
              <div className="w-16 h-16 bg-accent-blue/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Flame className="w-8 h-8 text-accent-blue" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {streaks?.workoutStreak || 0}
              </h3>
              <p className="text-text-gray mb-2">Workout Streak</p>
              <p className="text-sm text-accent-blue">
                {getMotivationalMessage(streaks?.workoutStreak || 0, 'workout')}
              </p>
            </div>
          </div>

          {/* Water Streak */}
          <div className="card card-hover">
            <div className="text-center">
              <div className="w-16 h-16 bg-accent-blue/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Droplets className="w-8 h-8 text-accent-blue" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {streaks?.waterStreak || 0}
              </h3>
              <p className="text-text-gray mb-2">Water Streak</p>
              <p className="text-sm text-accent-blue">
                {getMotivationalMessage(streaks?.waterStreak || 0, 'water')}
              </p>
            </div>
          </div>

          {/* Diet Streak */}
          <div className="card card-hover">
            <div className="text-center">
              <div className="w-16 h-16 bg-accent-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Utensils className="w-8 h-8 text-accent-green" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {streaks?.dietStreak || 0}
              </h3>
              <p className="text-text-gray mb-2">Diet Streak</p>
              <p className="text-sm text-accent-green">
                {getMotivationalMessage(streaks?.dietStreak || 0, 'diet')}
              </p>
            </div>
          </div>
        </div>

        {/* Earned Badges */}
        <div className="card mb-8">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Trophy className="w-6 h-6 mr-2 text-accent-green" />
            Your Badges
          </h3>
          
          {streaks?.badges && streaks.badges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {streaks.badges.map((badge, index) => (
                <div key={index} className="bg-primary-dark-light rounded-lg p-6 text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-accent-blue to-accent-green rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-10 h-10 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">{badge.name}</h4>
                  <p className="text-text-gray text-sm mb-3">{badge.description}</p>
                  <p className="text-accent-blue text-xs">
                    Earned on {new Date(badge.earnedDate).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-text-gray mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-white mb-2">No badges yet</h4>
              <p className="text-text-gray mb-6">Keep building your streaks to earn your first badge!</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <div className="p-4 bg-primary-dark-light rounded-lg">
                  <Flame className="w-8 h-8 text-accent-blue mx-auto mb-2" />
                  <p className="text-sm text-text-gray">Work out daily</p>
                </div>
                <div className="p-4 bg-primary-dark-light rounded-lg">
                  <Droplets className="w-8 h-8 text-accent-blue mx-auto mb-2" />
                  <p className="text-sm text-text-gray">Stay hydrated</p>
                </div>
                <div className="p-4 bg-primary-dark-light rounded-lg">
                  <Utensils className="w-8 h-8 text-accent-green mx-auto mb-2" />
                  <p className="text-sm text-text-gray">Log your meals</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Available Badges */}
        <div className="card">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Target className="w-6 h-6 mr-2 text-accent-blue" />
            Available Badges
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableBadges.map((badge, index) => {
              const isEarned = streaks?.badges?.some(earnedBadge => earnedBadge.name === badge.name);
              
              return (
                <div 
                  key={index} 
                  className={`rounded-lg p-6 text-center transition-all duration-300 ${
                    isEarned 
                      ? 'bg-gradient-to-r from-accent-blue/20 to-accent-green/20 border border-accent-blue/30' 
                      : 'bg-primary-dark-light border border-primary-dark-lighter'
                  }`}
                >
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    isEarned 
                      ? 'bg-gradient-to-r from-accent-blue to-accent-green' 
                      : 'bg-primary-dark-lighter'
                  }`}>
                    {isEarned ? (
                      <Trophy className="w-10 h-10 text-white" />
                    ) : (
                      <Star className="w-10 h-10 text-text-gray" />
                    )}
                  </div>
                  <h4 className={`text-lg font-semibold mb-2 ${
                    isEarned ? 'text-white' : 'text-text-gray'
                  }`}>
                    {badge.name}
                  </h4>
                  <p className="text-text-gray text-sm mb-3">{badge.description}</p>
                  <div className="text-xs">
                    {badge.requirement.type === 'workout' && (
                      <p className="text-accent-blue">
                        Complete {badge.requirement.count} workout{badge.requirement.count > 1 ? 's' : ''}
                      </p>
                    )}
                    {badge.requirement.type === 'workout_streak' && (
                      <p className="text-accent-blue">
                        {badge.requirement.count} day workout streak
                      </p>
                    )}
                    {badge.requirement.type === 'water_streak' && (
                      <p className="text-accent-blue">
                        {badge.requirement.count} day water streak
                      </p>
                    )}
                    {badge.requirement.type === 'diet_streak' && (
                      <p className="text-accent-green">
                        {badge.requirement.count} day diet streak
                      </p>
                    )}
                    {badge.requirement.type === 'meal_count' && (
                      <p className="text-accent-green">
                        Log {badge.requirement.count} meals
                      </p>
                    )}
                  </div>
                  {isEarned && (
                    <div className="mt-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accent-green/20 text-accent-green">
                        <Award className="w-3 h-3 mr-1" />
                        Earned
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress Tips */}
        <div className="card mt-8">
          <h3 className="text-xl font-semibold text-white mb-4">💡 Tips to Build Your Streaks</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 bg-primary-dark-light rounded-lg">
                <h4 className="text-white font-medium mb-2 flex items-center">
                  <Flame className="w-5 h-5 mr-2 text-accent-blue" />
                  Workout Streak
                </h4>
                <ul className="text-text-gray text-sm space-y-1">
                  <li>• Start with 10-minute daily workouts</li>
                  <li>• Set a consistent time each day</li>
                  <li>• Track even light activities like walking</li>
                  <li>• Use rest days for stretching or yoga</li>
                </ul>
              </div>
              
              <div className="p-4 bg-primary-dark-light rounded-lg">
                <h4 className="text-white font-medium mb-2 flex items-center">
                  <Droplets className="w-5 h-5 mr-2 text-accent-blue" />
                  Water Streak
                </h4>
                <ul className="text-text-gray text-sm space-y-1">
                  <li>• Keep a water bottle with you always</li>
                  <li>• Set hourly reminders to drink</li>
                  <li>• Start your day with a glass of water</li>
                  <li>• Track your intake throughout the day</li>
                </ul>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-primary-dark-light rounded-lg">
                <h4 className="text-white font-medium mb-2 flex items-center">
                  <Utensils className="w-5 h-5 mr-2 text-accent-green" />
                  Diet Streak
                </h4>
                <ul className="text-text-gray text-sm space-y-1">
                  <li>• Log meals immediately after eating</li>
                  <li>• Take photos of your meals</li>
                  <li>• Plan your meals in advance</li>
                  <li>• Include snacks and beverages</li>
                </ul>
              </div>
              
              <div className="p-4 bg-primary-dark-light rounded-lg">
                <h4 className="text-white font-medium mb-2 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-accent-green" />
                  General Tips
                </h4>
                <ul className="text-text-gray text-sm space-y-1">
                  <li>• Focus on consistency over perfection</li>
                  <li>• Celebrate small wins daily</li>
                  <li>• Don't break streaks for minor setbacks</li>
                  <li>• Share your progress with friends</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Streaks;
