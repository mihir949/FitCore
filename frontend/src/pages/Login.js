import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Zap } from 'lucide-react';



const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const result = await login(formData.email, formData.password);
  
      if (result.success) {
        navigate('/dashboard');
      } else {
        alert(result.error || "Login failed");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("Something went wrong. Please try again.");
    }
  
    setLoading(false);
  };
  

  return (
    <div className="min-h-screen bg-primary-black flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-accent-blue to-accent-green rounded-2xl mb-4">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">FitCore</h1>
          <p className="text-text-gray mt-2">Welcome back! Sign in to continue</p>
        </div>

        {/* Login Form */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-white mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-white mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="input-field pr-12"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-gray hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-text-gray">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-accent-blue hover:text-accent-green font-medium transition-colors duration-300"
              >
                Sign up here
              </Link>
            </p>
          </div>
        </div>

        {/* Features Preview */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-primary-dark rounded-lg">
            <div className="w-8 h-8 bg-accent-blue/20 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Zap className="w-4 h-4 text-accent-blue" />
            </div>
            <p className="text-sm text-text-gray">Track Workouts</p>
          </div>
          <div className="text-center p-4 bg-primary-dark rounded-lg">
            <div className="w-8 h-8 bg-accent-green/20 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-accent-green text-lg">🍎</span>
            </div>
            <p className="text-sm text-text-gray">Log Meals</p>
          </div>
          <div className="text-center p-4 bg-primary-dark rounded-lg">
            <div className="w-8 h-8 bg-accent-blue/20 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-accent-blue text-lg">💧</span>
            </div>
            <p className="text-sm text-text-gray">Water Intake</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
