import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Home, 
  Dumbbell, 
  Utensils, 
  Droplets, 
  Trophy, 
  Calendar,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Zap
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/workouts', icon: Dumbbell, label: 'Workouts' },
    { path: '/diet', icon: Utensils, label: 'Diet' },
    { path: '/water', icon: Droplets, label: 'Water' },
    { path: '/streaks', icon: Trophy, label: 'Streaks' },
    { path: '/meal-planner', icon: Calendar, label: 'Meal Planner' },
    { path: '/reminders', icon: Bell, label: 'Reminders' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-primary-dark border-b border-primary-dark-light sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-accent-blue to-accent-green rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">FitCore</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                    isActive(item.path)
                      ? 'bg-accent-blue text-white'
                      : 'text-text-gray hover:text-white hover:bg-primary-dark-light'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/profile"
              className="flex items-center space-x-3 px-3 py-2 text-text-gray hover:text-white hover:bg-primary-dark-light rounded-lg transition-all duration-300"
            >
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover border-2 border-accent-blue"
                />
              ) : (
                <div className="w-8 h-8 bg-primary-dark-light rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-text-gray" />
                </div>
              )}
              <span className="text-text-white font-medium">{user?.name}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 text-text-gray hover:text-white hover:bg-primary-dark-light rounded-lg transition-all duration-300"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-text-gray hover:text-white"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-primary-dark-light">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-300 ${
                      isActive(item.path)
                        ? 'bg-accent-blue text-white'
                        : 'text-text-gray hover:text-white hover:bg-primary-dark-light'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
              
              {/* Mobile User Info */}
              <div className="border-t border-primary-dark-light pt-3 mt-3">
                <Link
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-3 py-2 text-text-gray hover:text-white hover:bg-primary-dark-light rounded-lg transition-all duration-300"
                >
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover border-2 border-accent-blue"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-primary-dark-light rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-text-gray" />
                    </div>
                  )}
                  <span className="text-text-white font-medium">{user?.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 px-3 py-2 text-text-gray hover:text-white hover:bg-primary-dark-light rounded-lg transition-all duration-300 w-full"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
