import React, { useState, useEffect } from 'react';
import { dietAPI } from '../utils/api';
import { 
  Calendar, 
  Plus, 
  Utensils, 
  Clock,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const MealPlanner = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [meals, setMeals] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedMealType, setSelectedMealType] = useState('breakfast');
  const [formData, setFormData] = useState({
    foodName: '',
    calories: '',
    mealType: 'breakfast',
    quantity: '1 serving',
    image: '',
  });

  const mealTypes = [
    { value: 'breakfast', label: 'Breakfast', icon: '🌅', color: 'bg-yellow-500/20' },
    { value: 'lunch', label: 'Lunch', icon: '☀️', color: 'bg-orange-500/20' },
    { value: 'dinner', label: 'Dinner', icon: '🌙', color: 'bg-purple-500/20' },
    { value: 'snack', label: 'Snack', icon: '🍿', color: 'bg-pink-500/20' },
  ];

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    fetchWeekMeals();
  }, [currentWeek]);

  const getWeekDates = (date) => {
    const week = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const fetchWeekMeals = async () => {
    try {
      setLoading(true);
      const weekDates = getWeekDates(currentWeek);
      const startDate = weekDates[0];
      const endDate = weekDates[6];
      
      const response = await dietAPI.getMealsByRange(
        startDate.toISOString(),
        endDate.toISOString()
      );
      
      // Organize meals by date
      const mealsByDate = {};
      response.data.forEach(meal => {
        const date = new Date(meal.date).toDateString();
        if (!mealsByDate[date]) {
          mealsByDate[date] = [];
        }
        mealsByDate[date].push(meal);
      });
      
      setMeals(mealsByDate);
    } catch (error) {
      console.error('Error fetching week meals:', error);
      toast.error('Failed to load meal planner');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const mealData = {
        ...formData,
        calories: parseInt(formData.calories),
        date: selectedDate,
      };

      await dietAPI.addMeal(mealData);
      toast.success('Meal added to planner!');
      
      setShowModal(false);
      setFormData({
        foodName: '',
        calories: '',
        mealType: 'breakfast',
        quantity: '1 serving',
        image: '',
      });
      fetchWeekMeals();
    } catch (error) {
      console.error('Error adding meal:', error);
      toast.error('Failed to add meal');
    }
  };

  const handleDelete = async (mealId) => {
    if (window.confirm('Are you sure you want to delete this meal?')) {
      try {
        await dietAPI.deleteMeal(mealId);
        toast.success('Meal removed from planner!');
        fetchWeekMeals();
      } catch (error) {
        console.error('Error deleting meal:', error);
        toast.error('Failed to delete meal');
      }
    }
  };

  const openAddMealModal = (date, mealType) => {
    setSelectedDate(date);
    setSelectedMealType(mealType);
    setFormData(prev => ({ ...prev, mealType }));
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({
      foodName: '',
      calories: '',
      mealType: 'breakfast',
      quantity: '1 serving',
      image: '',
    });
  };

  const navigateWeek = (direction) => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + (direction * 7));
    setCurrentWeek(newWeek);
  };

  const getMealsForDate = (date) => {
    return meals[date.toDateString()] || [];
  };

  const getMealsForDateAndType = (date, mealType) => {
    const dateMeals = getMealsForDate(date);
    return dateMeals.filter(meal => meal.mealType === mealType);
  };

  const getTotalCaloriesForDate = (date) => {
    const dateMeals = getMealsForDate(date);
    return dateMeals.reduce((sum, meal) => sum + meal.calories, 0);
  };

  const getMealIcon = (type) => {
    const mealType = mealTypes.find(mt => mt.value === type);
    return mealType ? mealType.icon : '🍽️';
  };

  const getMealColor = (type) => {
    const mealType = mealTypes.find(mt => mt.value === type);
    return mealType ? mealType.color : 'bg-gray-500/20';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue"></div>
      </div>
    );
  }

  const weekDates = getWeekDates(currentWeek);

  return (
    <div className="min-h-screen bg-primary-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Meal Planner</h1>
            <p className="text-text-gray">Plan your meals for the week ahead</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateWeek(-1)}
              className="p-2 text-text-gray hover:text-white hover:bg-primary-dark-light rounded-lg transition-all duration-300"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-white font-medium min-w-[200px] text-center">
              {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
            <button
              onClick={() => navigateWeek(1)}
              className="p-2 text-text-gray hover:text-white hover:bg-primary-dark-light rounded-lg transition-all duration-300"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Week Overview */}
        <div className="card mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Weekly Overview</h3>
          <div className="grid grid-cols-7 gap-4">
            {weekDates.map((date, index) => {
              const totalCalories = getTotalCaloriesForDate(date);
              const isToday = date.toDateString() === new Date().toDateString();
              
              return (
                <div key={index} className={`text-center p-3 rounded-lg ${
                  isToday ? 'bg-accent-blue/20 border border-accent-blue/30' : 'bg-primary-dark-light'
                }`}>
                  <p className="text-text-gray text-sm mb-1">{daysOfWeek[index].slice(0, 3)}</p>
                  <p className="text-white font-medium mb-2">{date.getDate()}</p>
                  <p className="text-accent-green text-sm">{totalCalories} cal</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weekly Meal Grid */}
        <div className="grid grid-cols-7 gap-4">
          {weekDates.map((date, index) => {
            const isToday = date.toDateString() === new Date().toDateString();
            
            return (
              <div key={index} className="space-y-4">
                {/* Day Header */}
                <div className={`text-center p-3 rounded-lg ${
                  isToday ? 'bg-accent-blue/20 border border-accent-blue/30' : 'bg-primary-dark'
                }`}>
                  <h3 className="text-white font-semibold">{daysOfWeek[index]}</h3>
                  <p className="text-text-gray text-sm">{date.getDate()}</p>
                </div>

                {/* Meal Types */}
                {mealTypes.map((mealType) => {
                  const typeMeals = getMealsForDateAndType(date, mealType.value);
                  const typeCalories = typeMeals.reduce((sum, meal) => sum + meal.calories, 0);
                  
                  return (
                    <div key={mealType.value} className="bg-primary-dark rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{mealType.icon}</span>
                          <span className="text-text-white text-sm font-medium">{mealType.label}</span>
                        </div>
                        <span className="text-accent-green text-xs">{typeCalories} cal</span>
                      </div>
                      
                      {/* Add Meal Button */}
                      <button
                        onClick={() => openAddMealModal(date.toISOString().split('T')[0], mealType.value)}
                        className="w-full p-2 border-2 border-dashed border-primary-dark-lighter rounded-lg text-text-gray hover:border-accent-blue hover:text-accent-blue transition-all duration-300 flex items-center justify-center space-x-1"
                      >
                        <Plus className="w-4 h-4" />
                        <span className="text-xs">Add Meal</span>
                      </button>
                      
                      {/* Meals List */}
                      {typeMeals.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {typeMeals.map((meal) => (
                            <div key={meal._id} className="bg-primary-dark-light rounded-lg p-2">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className="text-white text-sm font-medium truncate">
                                    {meal.foodName}
                                  </p>
                                  <p className="text-text-gray text-xs">{meal.quantity}</p>
                                </div>
                                <button
                                  onClick={() => handleDelete(meal._id)}
                                  className="p-1 text-text-gray hover:text-red-500 transition-colors ml-2"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                              
                              {meal.image && (
                                <div className="mt-2">
                                  <img
                                    src={meal.image}
                                    alt={meal.foodName}
                                    className="w-full h-16 object-cover rounded"
                                  />
                                </div>
                              )}
                              
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-accent-green text-xs font-medium">
                                  {meal.calories} cal
                                </span>
                                <span className="text-text-gray text-xs">
                                  {new Date(meal.date).toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Add Meal Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-primary-dark rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-white mb-6">Add Meal to Planner</h2>
              
              <div className="mb-4 p-3 bg-primary-dark-light rounded-lg">
                <p className="text-text-gray text-sm">Date: {new Date(selectedDate).toLocaleDateString()}</p>
                <p className="text-text-gray text-sm">Meal: {mealTypes.find(mt => mt.value === selectedMealType)?.label}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-white mb-2">
                    Food Name
                  </label>
                  <input
                    type="text"
                    name="foodName"
                    value={formData.foodName}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="e.g., Grilled Chicken Breast"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-white mb-2">
                      Calories
                    </label>
                    <input
                      type="number"
                      name="calories"
                      value={formData.calories}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="250"
                      required
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-white mb-2">
                      Quantity
                    </label>
                    <input
                      type="text"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="1 serving"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-white mb-2">
                    Meal Type
                  </label>
                  <select
                    name="mealType"
                    value={formData.mealType}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  >
                    {mealTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                  >
                    Add to Planner
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MealPlanner;
