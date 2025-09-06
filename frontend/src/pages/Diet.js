import React, { useState, useEffect } from 'react';
import { dietAPI, uploadAPI } from '../utils/api';
import { 
  Plus, 
  Utensils, 
  Flame, 
  Edit, 
  Trash2, 
  Upload,
  Calendar,
  PieChart
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import toast from 'react-hot-toast';

ChartJS.register(ArcElement, Tooltip, Legend);

const Diet = () => {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [formData, setFormData] = useState({
    foodName: '',
    calories: '',
    mealType: 'breakfast',
    quantity: '1 serving',
    image: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const mealTypes = [
    { value: 'breakfast', label: 'Breakfast', icon: '🌅' },
    { value: 'lunch', label: 'Lunch', icon: '☀️' },
    { value: 'dinner', label: 'Dinner', icon: '🌙' },
    { value: 'snack', label: 'Snack', icon: '🍿' },
  ];

  useEffect(() => {
    fetchMeals();
  }, [selectedDate]);

  const fetchMeals = async () => {
    try {
      setLoading(true);
      const response = await dietAPI.getMealsByDate(selectedDate);
      setMeals(response.data);
    } catch (error) {
      console.error('Error fetching meals:', error);
      toast.error('Failed to load meals');
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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let imageUrl = formData.image;
      
      // Upload image if selected
      if (imageFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('image', imageFile);
        
        const uploadResponse = await uploadAPI.uploadImage(uploadFormData);
        imageUrl = uploadResponse.data.imageUrl;
      }

      const mealData = {
        ...formData,
        calories: parseInt(formData.calories),
        date: selectedDate,
        image: imageUrl,
      };

      if (editingMeal) {
        await dietAPI.updateMeal(editingMeal._id, mealData);
        toast.success('Meal updated successfully!');
      } else {
        await dietAPI.addMeal(mealData);
        toast.success('Meal added successfully!');
      }

      setShowModal(false);
      setEditingMeal(null);
      setFormData({
        foodName: '',
        calories: '',
        mealType: 'breakfast',
        quantity: '1 serving',
        image: '',
      });
      setImageFile(null);
      setImagePreview('');
      fetchMeals();
    } catch (error) {
      console.error('Error saving meal:', error);
      toast.error('Failed to save meal');
    }
  };

  const handleEdit = (meal) => {
    setEditingMeal(meal);
    setFormData({
      foodName: meal.foodName,
      calories: meal.calories.toString(),
      mealType: meal.mealType,
      quantity: meal.quantity,
      image: meal.image || '',
    });
    setImagePreview(meal.image || '');
    setShowModal(true);
  };

  const handleDelete = async (mealId) => {
    if (window.confirm('Are you sure you want to delete this meal?')) {
      try {
        await dietAPI.deleteMeal(mealId);
        toast.success('Meal deleted successfully!');
        fetchMeals();
      } catch (error) {
        console.error('Error deleting meal:', error);
        toast.error('Failed to delete meal');
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingMeal(null);
    setFormData({
      foodName: '',
      calories: '',
      mealType: 'breakfast',
      quantity: '1 serving',
      image: '',
    });
    setImageFile(null);
    setImagePreview('');
  };

  const getMealIcon = (type) => {
    const mealType = mealTypes.find(mt => mt.value === type);
    return mealType ? mealType.icon : '🍽️';
  };

  const getMealLabel = (type) => {
    const mealType = mealTypes.find(mt => mt.value === type);
    return mealType ? mealType.label : 'Meal';
  };

  const getTotalCalories = () => {
    return meals.reduce((sum, meal) => sum + meal.calories, 0);
  };

  const getCaloriesByMealType = () => {
    const caloriesByType = {};
    mealTypes.forEach(type => {
      caloriesByType[type.value] = 0;
    });
    
    meals.forEach(meal => {
      caloriesByType[meal.mealType] += meal.calories;
    });
    
    return caloriesByType;
  };

  const getChartData = () => {
    const caloriesByType = getCaloriesByMealType();
    const colors = ['#3a08f1', '#00ff7f', '#ff6b6b', '#ffd93d'];
    
    return {
      labels: mealTypes.map(type => type.label),
      datasets: [
        {
          data: mealTypes.map(type => caloriesByType[type.value]),
          backgroundColor: colors,
          borderColor: colors.map(color => color + '80'),
          borderWidth: 2,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#cccccc',
          padding: 20,
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Diet Tracker</h1>
            <p className="text-text-gray">Track your meals and calorie intake</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Meal</span>
          </button>
        </div>

        {/* Date Selector */}
        <div className="card mb-6">
          <div className="flex items-center space-x-4">
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

        {/* Daily Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Flame className="w-5 h-5 mr-2 text-accent-green" />
              Daily Calorie Summary
            </h3>
            <div className="text-center">
              <div className="text-4xl font-bold text-accent-green mb-2">
                {getTotalCalories()}
              </div>
              <p className="text-text-gray">Total Calories</p>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-semibold text-white">{meals.length}</p>
                  <p className="text-text-gray text-sm">Meals Logged</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-white">
                    {meals.length > 0 ? Math.round(getTotalCalories() / meals.length) : 0}
                  </p>
                  <p className="text-text-gray text-sm">Avg per Meal</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <PieChart className="w-5 h-5 mr-2 text-accent-blue" />
              Calories by Meal Type
            </h3>
            {getTotalCalories() > 0 ? (
              <Doughnut data={getChartData()} options={chartOptions} />
            ) : (
              <div className="text-center py-8">
                <Utensils className="w-12 h-12 text-text-gray mx-auto mb-2" />
                <p className="text-text-gray">No meals logged for this date</p>
              </div>
            )}
          </div>
        </div>

        {/* Meals by Type */}
        {mealTypes.map((mealType) => {
          const typeMeals = meals.filter(meal => meal.mealType === mealType.value);
          const typeCalories = typeMeals.reduce((sum, meal) => sum + meal.calories, 0);
          
          return (
            <div key={mealType.value} className="card mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{mealType.icon}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{mealType.label}</h3>
                    <p className="text-text-gray text-sm">{typeMeals.length} items • {typeCalories} calories</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setFormData(prev => ({ ...prev, mealType: mealType.value }));
                    setShowModal(true);
                  }}
                  className="btn-secondary text-sm"
                >
                  Add {mealType.label}
                </button>
              </div>

              {typeMeals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {typeMeals.map((meal) => (
                    <div key={meal._id} className="bg-primary-dark-light rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="text-white font-medium">{meal.foodName}</h4>
                          <p className="text-text-gray text-sm">{meal.quantity}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(meal)}
                            className="p-1 text-text-gray hover:text-accent-blue transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(meal._id)}
                            className="p-1 text-text-gray hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {meal.image && (
                        <div className="mb-3">
                          <img
                            src={meal.image}
                            alt={meal.foodName}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Flame className="w-4 h-4 text-accent-green" />
                          <span className="text-accent-green font-medium">{meal.calories} cal</span>
                        </div>
                        <span className="text-text-gray text-sm">
                          {new Date(meal.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-text-gray">
                  <Utensils className="w-8 h-8 mx-auto mb-2" />
                  <p>No {mealType.label.toLowerCase()} logged</p>
                </div>
              )}
            </div>
          );
        })}

        {/* Add/Edit Meal Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-primary-dark rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-white mb-6">
                {editingMeal ? 'Edit Meal' : 'Add New Meal'}
              </h2>

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

                <div>
                  <label className="block text-sm font-medium text-text-white mb-2">
                    Food Image
                  </label>
                  <div className="space-y-3">
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    )}
                    <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-primary-dark-lighter rounded-lg cursor-pointer hover:border-accent-blue transition-colors">
                      <div className="text-center">
                        <Upload className="w-6 h-6 text-text-gray mx-auto mb-2" />
                        <p className="text-text-gray text-sm">
                          {imagePreview ? 'Change Image' : 'Upload Food Image'}
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
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
                    {editingMeal ? 'Update' : 'Add'} Meal
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

export default Diet;
