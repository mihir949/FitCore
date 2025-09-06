import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { uploadAPI } from '../utils/api';
import { 
  User, 
  Mail, 
  Ruler, 
  Weight, 
  Calendar, 
  Target, 
  Camera, 
  Save,
  Edit3,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    height: '',
    weight: '',
    age: '',
    fitnessGoals: 'general_fitness',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        height: user.height || '',
        weight: user.weight || '',
        age: user.age || '',
        fitnessGoals: user.fitnessGoals || 'general_fitness',
      });
      setProfileImagePreview(user.profileImage || '');
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setProfileImage(file);
    setProfileImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let profileImageUrl = user.profileImage || '';
      
      // Upload new profile image if selected
      if (profileImage) {
        const formData = new FormData();
        formData.append('image', profileImage);
        
        const uploadResponse = await uploadAPI.uploadImage(formData);
        profileImageUrl = uploadResponse.data.imageUrl;
      }

      // Update user profile
      const updatedUserData = {
        name: formData.name,
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        age: parseInt(formData.age),
        fitnessGoals: formData.fitnessGoals,
        profileImage: profileImageUrl,
      };

      // Make API call to update profile
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(updatedUserData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        updateUser(updatedUser.user);
        setIsEditing(false);
        toast.success('Profile updated successfully!');
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile. Please try again.');
    }
    
    setLoading(false);
  };

  const fitnessGoals = [
    { value: 'weight_loss', label: 'Weight Loss' },
    { value: 'muscle_gain', label: 'Muscle Gain' },
    { value: 'endurance', label: 'Endurance' },
    { value: 'general_fitness', label: 'General Fitness' },
  ];

  const getFitnessGoalLabel = (value) => {
    const goal = fitnessGoals.find(g => g.value === value);
    return goal ? goal.label : 'General Fitness';
  };

  if (!user) {
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
            <p className="text-text-gray">Manage your personal information and fitness goals</p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
              isEditing 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-accent-blue hover:bg-accent-blue/90 text-white'
            }`}
          >
            {isEditing ? (
              <>
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </>
            ) : (
              <>
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile</span>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Image Section */}
          <div className="lg:col-span-1">
            <div className="card text-center">
              <h3 className="text-lg font-semibold text-white mb-4">Profile Picture</h3>
              
              <div className="relative inline-block mb-4">
                {profileImagePreview ? (
                  <img
                    src={profileImagePreview}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-accent-blue mx-auto"
                  />
                ) : (
                  <div className="w-32 h-32 bg-primary-dark-light rounded-full flex items-center justify-center border-4 border-dashed border-primary-dark-lighter mx-auto">
                    <User className="w-16 h-16 text-text-gray" />
                  </div>
                )}
                
                {isEditing && (
                  <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-accent-blue rounded-full flex items-center justify-center cursor-pointer hover:bg-accent-blue/90 transition-colors">
                    <Camera className="w-5 h-5 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              
              {isEditing && (
                <p className="text-sm text-text-gray">Click the camera icon to change photo</p>
              )}
            </div>
          </div>

          {/* Profile Information */}
          <div className="lg:col-span-2">
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-6">Personal Information</h3>
              
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-text-white mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="input-field"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-text-white mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        className="input-field bg-primary-dark-lighter cursor-not-allowed"
                        disabled
                      />
                      <p className="text-xs text-text-gray mt-1">Email cannot be changed</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-text-white mb-2">
                        Height (cm)
                      </label>
                      <input
                        type="number"
                        name="height"
                        value={formData.height}
                        onChange={handleChange}
                        className="input-field"
                        min="100"
                        max="250"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-text-white mb-2">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        name="weight"
                        value={formData.weight}
                        onChange={handleChange}
                        className="input-field"
                        min="30"
                        max="300"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-text-white mb-2">
                        Age
                      </label>
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        className="input-field"
                        min="13"
                        max="120"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-white mb-2">
                      Fitness Goals
                    </label>
                    <select
                      name="fitnessGoals"
                      value={formData.fitnessGoals}
                      onChange={handleChange}
                      className="input-field"
                    >
                      {fitnessGoals.map((goal) => (
                        <option key={goal.value} value={goal.value}>
                          {goal.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="btn-secondary flex-1"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary flex-1 flex items-center justify-center"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-accent-blue/20 rounded-lg flex items-center justify-center">
                        <User className="w-5 h-5 text-accent-blue" />
                      </div>
                      <div>
                        <p className="text-text-gray text-sm">Full Name</p>
                        <p className="text-white font-medium">{user.name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-accent-green/20 rounded-lg flex items-center justify-center">
                        <Mail className="w-5 h-5 text-accent-green" />
                      </div>
                      <div>
                        <p className="text-text-gray text-sm">Email</p>
                        <p className="text-white font-medium">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-accent-blue/20 rounded-lg flex items-center justify-center">
                        <Ruler className="w-5 h-5 text-accent-blue" />
                      </div>
                      <div>
                        <p className="text-text-gray text-sm">Height</p>
                        <p className="text-white font-medium">{user.height} cm</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-accent-green/20 rounded-lg flex items-center justify-center">
                        <Weight className="w-5 h-5 text-accent-green" />
                      </div>
                      <div>
                        <p className="text-text-gray text-sm">Weight</p>
                        <p className="text-white font-medium">{user.weight} kg</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-accent-blue/20 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-accent-blue" />
                      </div>
                      <div>
                        <p className="text-text-gray text-sm">Age</p>
                        <p className="text-white font-medium">{user.age} years</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-accent-green/20 rounded-lg flex items-center justify-center">
                      <Target className="w-5 h-5 text-accent-green" />
                    </div>
                    <div>
                      <p className="text-text-gray text-sm">Fitness Goal</p>
                      <p className="text-white font-medium">{getFitnessGoalLabel(user.fitnessGoals)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;