import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { workoutAPI, dietAPI, waterAPI, streakAPI } from '../utils/api';
import { 
  Dumbbell, 
  Utensils, 
  Droplets, 
  Trophy, 
  TrendingUp,
  Calendar,
  Target,
  Flame
} from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    workouts: [],
    meals: [],
    water: [],
    streaks: null,
  });
  const [weeklyData, setWeeklyData] = useState({
    workouts: [],
    calories: [],
    water: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get date range for last 7 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      const [workoutsRes, mealsRes, waterRes, streaksRes] = await Promise.all([
        workoutAPI.getWorkoutsByRange(startDate.toISOString(), endDate.toISOString()),
        dietAPI.getMealsByRange(startDate.toISOString(), endDate.toISOString()),
        waterAPI.getWaterByRange(startDate.toISOString(), endDate.toISOString()),
        streakAPI.getStreaks(),
      ]);

      setStats({
        workouts: workoutsRes.data,
        meals: mealsRes.data,
        water: waterRes.data,
        streaks: streaksRes.data,
      });

      // Process weekly data for charts
      processWeeklyData(workoutsRes.data, mealsRes.data, waterRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const processWeeklyData = (workouts, meals, water) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weeklyWorkouts = new Array(7).fill(0);
    const weeklyCalories = new Array(7).fill(0);
    const weeklyWater = new Array(7).fill(0);

    // Process workouts
    workouts.forEach(workout => {
      const day = new Date(workout.date).getDay();
      const adjustedDay = day === 0 ? 6 : day - 1; // Convert Sunday to last day
      weeklyWorkouts[adjustedDay] += workout.duration;
    });

    // Process meals
    meals.forEach(meal => {
      const day = new Date(meal.date).getDay();
      const adjustedDay = day === 0 ? 6 : day - 1;
      weeklyCalories[adjustedDay] += meal.calories;
    });

    // Process water
    water.forEach(waterEntry => {
      const day = new Date(waterEntry.date).getDay();
      const adjustedDay = day === 0 ? 6 : day - 1;
      weeklyWater[adjustedDay] += waterEntry.glasses;
    });

    setWeeklyData({
      workouts: weeklyWorkouts,
      calories: weeklyCalories,
      water: weeklyWater,
    });
  };

  const getTodayStats = () => {
    const today = new Date().toDateString();
    
    const todayWorkouts = stats.workouts.filter(workout => 
      new Date(workout.date).toDateString() === today
    );
    
    const todayMeals = stats.meals.filter(meal => 
      new Date(meal.date).toDateString() === today
    );
    
    const todayWater = stats.water.find(water => 
      new Date(water.date).toDateString() === today
    );

    return {
      workoutDuration: todayWorkouts.reduce((sum, workout) => sum + workout.duration, 0),
      calories: todayMeals.reduce((sum, meal) => sum + meal.calories, 0),
      waterGlasses: todayWater ? todayWater.glasses : 0,
      workoutCount: todayWorkouts.length,
      mealCount: todayMeals.length,
    };
  };

  const todayStats = getTodayStats();

  const workoutChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Workout Duration (min)',
        data: weeklyData.workouts,
        backgroundColor: 'rgba(58, 8, 241, 0.8)',
        borderColor: 'rgba(58, 8, 241, 1)',
        borderWidth: 1,
      },
    ],
  };

  const calorieChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Calories',
        data: weeklyData.calories,
        backgroundColor: 'rgba(0, 255, 127, 0.8)',
        borderColor: 'rgba(0, 255, 127, 1)',
        borderWidth: 1,
      },
    ],
  };

  const waterChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Water Glasses',
        data: weeklyData.water,
        backgroundColor: 'rgba(58, 8, 241, 0.8)',
        borderColor: 'rgba(58, 8, 241, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: '#cccccc',
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#cccccc',
        },
        grid: {
          color: '#2a2a2a',
        },
      },
      y: {
        ticks: {
          color: '#cccccc',
        },
        grid: {
          color: '#2a2a2a',
        },
      },
    },
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-text-gray">
                Here's your fitness overview for today
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt="Profile"
                  className="w-12 h-12 rounded-full object-cover border-2 border-accent-blue"
                />
              ) : (
                <div className="w-12 h-12 bg-primary-dark-light rounded-full flex items-center justify-center">
                  <span className="text-text-gray text-lg">👤</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Today's Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-gray text-sm">Workout Duration</p>
                <p className="text-2xl font-bold text-white">{todayStats.workoutDuration} min</p>
                <p className="text-accent-blue text-sm">{todayStats.workoutCount} workouts</p>
              </div>
              <div className="w-12 h-12 bg-accent-blue/20 rounded-lg flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-accent-blue" />
              </div>
            </div>
          </div>

          <div className="card card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-gray text-sm">Calories Consumed</p>
                <p className="text-2xl font-bold text-white">{todayStats.calories}</p>
                <p className="text-accent-green text-sm">{todayStats.mealCount} meals</p>
              </div>
              <div className="w-12 h-12 bg-accent-green/20 rounded-lg flex items-center justify-center">
                <Utensils className="w-6 h-6 text-accent-green" />
              </div>
            </div>
          </div>

          <div className="card card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-gray text-sm">Water Intake</p>
                <p className="text-2xl font-bold text-white">{todayStats.waterGlasses} glasses</p>
                <p className="text-accent-blue text-sm">
                  {Math.round((todayStats.waterGlasses / 8) * 100)}% of goal
                </p>
              </div>
              <div className="w-12 h-12 bg-accent-blue/20 rounded-lg flex items-center justify-center">
                <Droplets className="w-6 h-6 text-accent-blue" />
              </div>
            </div>
          </div>

          <div className="card card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-gray text-sm">Workout Streak</p>
                <p className="text-2xl font-bold text-white">{stats.streaks?.workoutStreak || 0} days</p>
                <p className="text-accent-green text-sm">Keep it up!</p>
              </div>
              <div className="w-12 h-12 bg-accent-green/20 rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6 text-accent-green" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-accent-blue" />
              Weekly Workout Duration
            </h3>
            <Bar data={workoutChartData} options={chartOptions} />
          </div>

          <div className="card">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Flame className="w-5 h-5 mr-2 text-accent-green" />
              Weekly Calorie Intake
            </h3>
            <Bar data={calorieChartData} options={chartOptions} />
          </div>
        </div>

        {/* Water Intake Chart */}
        <div className="card mb-8">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Droplets className="w-5 h-5 mr-2 text-accent-blue" />
            Weekly Water Intake
          </h3>
          <Bar data={waterChartData} options={chartOptions} />
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-xl font-semibold text-white mb-4">Recent Workouts</h3>
            <div className="space-y-3">
              {stats.workouts.slice(0, 5).map((workout) => (
                <div key={workout._id} className="flex items-center justify-between p-3 bg-primary-dark-light rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-accent-blue/20 rounded-lg flex items-center justify-center">
                      <Dumbbell className="w-4 h-4 text-accent-blue" />
                    </div>
                    <div>
                      <p className="text-white font-medium capitalize">{workout.type}</p>
                      <p className="text-text-gray text-sm">
                        {new Date(workout.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">{workout.duration} min</p>
                    <p className="text-accent-green text-sm">{workout.calories} cal</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="text-xl font-semibold text-white mb-4">Recent Meals</h3>
            <div className="space-y-3">
              {stats.meals.slice(0, 5).map((meal) => (
                <div key={meal._id} className="flex items-center justify-between p-3 bg-primary-dark-light rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-accent-green/20 rounded-lg flex items-center justify-center">
                      <Utensils className="w-4 h-4 text-accent-green" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{meal.foodName}</p>
                      <p className="text-text-gray text-sm capitalize">{meal.mealType}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">{meal.calories} cal</p>
                    <p className="text-text-gray text-sm">
                      {new Date(meal.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
