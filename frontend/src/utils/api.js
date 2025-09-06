import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API functions
export const authAPI = {
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  register: (userData) => api.post('/api/auth/register', userData),
  getMe: () => api.get('/api/auth/me'),
};

export const workoutAPI = {
  getWorkouts: () => api.get('/api/workouts'),
  getWorkoutsByRange: (startDate, endDate) => 
    api.get(`/api/workouts/range?startDate=${startDate}&endDate=${endDate}`),
  addWorkout: (workoutData) => api.post('/api/workouts', workoutData),
  updateWorkout: (id, workoutData) => api.put(`/api/workouts/${id}`, workoutData),
  deleteWorkout: (id) => api.delete(`/api/workouts/${id}`),
};

export const dietAPI = {
  getMeals: () => api.get('/api/diet'),
  getMealsByRange: (startDate, endDate) => 
    api.get(`/api/diet/range?startDate=${startDate}&endDate=${endDate}`),
  getMealsByDate: (date) => api.get(`/api/diet/date/${date}`),
  getMealSummary: (date) => api.get(`/api/diet/summary/${date}`),
  addMeal: (mealData) => api.post('/api/diet', mealData),
  updateMeal: (id, mealData) => api.put(`/api/diet/${id}`, mealData),
  deleteMeal: (id) => api.delete(`/api/diet/${id}`),
};

export const waterAPI = {
  getWaterIntake: () => api.get('/api/water'),
  getWaterByRange: (startDate, endDate) => 
    api.get(`/api/water/range?startDate=${startDate}&endDate=${endDate}`),
  getTodayWater: () => api.get('/api/water/today'),
  getWeeklyWater: () => api.get('/api/water/weekly'),
  addWaterIntake: (glasses) => api.post('/api/water', { glasses }),
  addGlass: () => api.post('/api/water/add-glass'),
};

export const streakAPI = {
  getStreaks: () => api.get('/api/streaks'),
  updateStreaks: (streakData) => api.put('/api/streaks/update', streakData),
  addBadge: (badgeData) => api.post('/api/streaks/badge', badgeData),
  getAvailableBadges: () => api.get('/api/streaks/available-badges'),
  checkBadges: () => api.post('/api/streaks/check-badges'),
};

export const uploadAPI = {
  uploadImage: (formData) => api.post('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  uploadMultipleImages: (formData) => api.post('/api/upload/multiple', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
};

export default api;
