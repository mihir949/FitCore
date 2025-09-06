import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Workouts from './pages/Workouts';
import Diet from './pages/Diet';
import WaterTracker from './pages/WaterTracker';
import Streaks from './pages/Streaks';
import MealPlanner from './pages/MealPlanner';
import Profile from './pages/Profile';
import Reminders from './pages/Reminders';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-primary-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue"></div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
};

// Public Route Component (redirect to dashboard if logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-primary-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue"></div>
      </div>
    );
  }
  
  return user ? <Navigate to="/dashboard" /> : children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-primary-black">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#111111',
                color: '#ffffff',
                border: '1px solid #2a2a2a',
              },
            }}
          />
          
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } 
            />
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Navbar />
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/workouts" 
              element={
                <ProtectedRoute>
                  <Navbar />
                  <Workouts />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/diet" 
              element={
                <ProtectedRoute>
                  <Navbar />
                  <Diet />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/water" 
              element={
                <ProtectedRoute>
                  <Navbar />
                  <WaterTracker />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/streaks" 
              element={
                <ProtectedRoute>
                  <Navbar />
                  <Streaks />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/meal-planner" 
              element={
                <ProtectedRoute>
                  <Navbar />
                  <MealPlanner />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Navbar />
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/reminders" 
              element={
                <ProtectedRoute>
                  <Navbar />
                  <Reminders />
                </ProtectedRoute>
              } 
            />
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
