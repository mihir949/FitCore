import React, { useState, useEffect } from 'react';
import { workoutAPI, uploadAPI } from '../utils/api';
import { 
  Plus, 
  Dumbbell, 
  Clock, 
  Flame, 
  Edit, 
  Trash2, 
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import toast from 'react-hot-toast';

const Workouts = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [formData, setFormData] = useState({
    type: 'cardio',
    duration: '',
    calories: '',
    notes: '',
    image: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const workoutTypes = [
    { value: 'cardio', label: 'Cardio', icon: '🏃' },
    { value: 'strength', label: 'Strength Training', icon: '💪' },
    { value: 'yoga', label: 'Yoga', icon: '🧘' },
    { value: 'running', label: 'Running', icon: '🏃‍♂️' },
    { value: 'cycling', label: 'Cycling', icon: '🚴' },
    { value: 'swimming', label: 'Swimming', icon: '🏊' },
    { value: 'other', label: 'Other', icon: '🏋️' },
  ];

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      const response = await workoutAPI.getWorkouts();
      setWorkouts(response.data);
    } catch (error) {
      console.error('Error fetching workouts:', error);
      toast.error('Failed to load workouts');
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

      const workoutData = {
        ...formData,
        duration: parseInt(formData.duration),
        calories: parseInt(formData.calories),
        image: imageUrl,
      };

      if (editingWorkout) {
        await workoutAPI.updateWorkout(editingWorkout._id, workoutData);
        toast.success('Workout updated successfully!');
      } else {
        await workoutAPI.addWorkout(workoutData);
        toast.success('Workout added successfully!');
      }

      setShowModal(false);
      setEditingWorkout(null);
      setFormData({
        type: 'cardio',
        duration: '',
        calories: '',
        notes: '',
        image: '',
      });
      setImageFile(null);
      setImagePreview('');
      fetchWorkouts();
    } catch (error) {
      console.error('Error saving workout:', error);
      toast.error('Failed to save workout');
    }
  };

  const handleEdit = (workout) => {
    setEditingWorkout(workout);
    setFormData({
      type: workout.type,
      duration: workout.duration.toString(),
      calories: workout.calories.toString(),
      notes: workout.notes || '',
      image: workout.image || '',
    });
    setImagePreview(workout.image || '');
    setShowModal(true);
  };

  const handleDelete = async (workoutId) => {
    if (window.confirm('Are you sure you want to delete this workout?')) {
      try {
        await workoutAPI.deleteWorkout(workoutId);
        toast.success('Workout deleted successfully!');
        fetchWorkouts();
      } catch (error) {
        console.error('Error deleting workout:', error);
        toast.error('Failed to delete workout');
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingWorkout(null);
    setFormData({
      type: 'cardio',
      duration: '',
      calories: '',
      notes: '',
      image: '',
    });
    setImageFile(null);
    setImagePreview('');
  };

  const getWorkoutIcon = (type) => {
    const workoutType = workoutTypes.find(wt => wt.value === type);
    return workoutType ? workoutType.icon : '🏋️';
  };

  const getWorkoutLabel = (type) => {
    const workoutType = workoutTypes.find(wt => wt.value === type);
    return workoutType ? workoutType.label : 'Other';
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
            <h1 className="text-3xl font-bold text-white mb-2">Workouts</h1>
            <p className="text-text-gray">Track your fitness activities and progress</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Workout</span>
          </button>
        </div>

        {/* Workouts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workouts.map((workout) => (
            <div key={workout._id} className="card card-hover">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">{getWorkoutIcon(workout.type)}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {getWorkoutLabel(workout.type)}
                    </h3>
                    <p className="text-text-gray text-sm">
                      {new Date(workout.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(workout)}
                    className="p-2 text-text-gray hover:text-accent-blue transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(workout._id)}
                    className="p-2 text-text-gray hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {workout.image && (
                <div className="mb-4">
                  <img
                    src={workout.image}
                    alt="Workout"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-accent-blue" />
                  <span className="text-text-gray text-sm">Duration</span>
                </div>
                <div className="text-white font-medium">{workout.duration} min</div>
                
                <div className="flex items-center space-x-2">
                  <Flame className="w-4 h-4 text-accent-green" />
                  <span className="text-text-gray text-sm">Calories</span>
                </div>
                <div className="text-white font-medium">{workout.calories} cal</div>
              </div>

              {workout.notes && (
                <div className="pt-4 border-t border-primary-dark-light">
                  <p className="text-text-gray text-sm">{workout.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {workouts.length === 0 && (
          <div className="text-center py-12">
            <Dumbbell className="w-16 h-16 text-text-gray mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No workouts yet</h3>
            <p className="text-text-gray mb-6">Start your fitness journey by adding your first workout!</p>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary"
            >
              Add Your First Workout
            </button>
          </div>
        )}

        {/* Add/Edit Workout Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-primary-dark rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-white mb-6">
                {editingWorkout ? 'Edit Workout' : 'Add New Workout'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-white mb-2">
                    Workout Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  >
                    {workoutTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-white mb-2">
                      Duration (min)
                    </label>
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="30"
                      required
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-white mb-2">
                      Calories Burned
                    </label>
                    <input
                      type="number"
                      name="calories"
                      value={formData.calories}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="300"
                      required
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-white mb-2">
                    Workout Image
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
                          {imagePreview ? 'Change Image' : 'Upload Image'}
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

                <div>
                  <label className="block text-sm font-medium text-text-white mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="input-field"
                    rows="3"
                    placeholder="How did you feel? Any observations..."
                  />
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
                    {editingWorkout ? 'Update' : 'Add'} Workout
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

export default Workouts;
