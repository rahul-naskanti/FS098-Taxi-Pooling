import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaCarSide, FaUser } from 'react-icons/fa';
import { authService } from '../../services/authService';
import { validateEmail } from '../../utils/auth';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'passenger' // Default role
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear validation error when typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleRoleChange = (selectedRole) => {
    setFormData({
      ...formData,
      role: selectedRole
    });
  };

  const validateForm = () => {
    const tempErrors = {};
    if (!formData.email) {
      tempErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      tempErrors.email = "Please enter a valid email address";
    }
    if (!formData.password) {
      tempErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      tempErrors.password = "Password must be at least 6 characters";
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setServerError('');

    try {
      const data = await authService.login(formData.email, formData.password);

      // Save info in session storage
      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('role', data.role);

      if (data.role === 'driver') {
        navigate('/driver');
      } else if (data.role === 'passenger') {
        navigate('/passenger');
      } else if (data.role === 'admin') {
        navigate('/admin');
      }
    } catch (err) {
      setServerError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] flex flex-col justify-center items-center px-4 relative overflow-hidden text-slate-200">
      {/* Decorative background glows */}
      <div className="absolute top-1/10 left-1/4 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/10 right-1/4 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDuration: '6s' }}></div>

      {/* Back to Home Logo */}
      <div className="mb-8">
        <Link to="/" className="flex items-center gap-3 cursor-pointer group">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <FaCarSide className="text-xl" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white font-display">
            FS098 <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">TaxiPool</span>
          </span>
        </Link>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-gradient-to-b from-slate-900 to-[#0e1526] border border-slate-800 rounded-3xl p-8 shadow-2xl relative">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-t-3xl"></div>

        <h2 className="text-2xl font-extrabold text-white text-center font-display mb-2">Welcome Back</h2>
        <p className="text-slate-400 text-sm text-center mb-8 font-sans">
          Log in to manage your pool and search matches
        </p>

        {serverError && (
          <div className="p-3 bg-red-950/20 border border-red-500/20 text-red-400 text-xs font-bold rounded-xl animate-fadeIn mb-4">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Role Tab Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Role</label>
            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800/80">
              <button
                type="button"
                onClick={() => handleRoleChange('passenger')}
                className={`py-2 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${formData.role === 'passenger'
                    ? 'bg-gradient-to-r from-emerald-500/15 to-teal-500/15 border border-emerald-500/35 text-emerald-400 shadow-sm'
                    : 'border border-transparent text-slate-400 hover:text-white'
                  }`}
              >
                <FaUser className="text-xs" /> Passenger
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('driver')}
                className={`py-2 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${formData.role === 'driver'
                    ? 'bg-gradient-to-r from-emerald-500/15 to-teal-500/15 border border-emerald-500/35 text-emerald-400 shadow-sm'
                    : 'border border-transparent text-slate-400 hover:text-white'
                  }`}
              >
                <FaCarSide className="text-xs" /> Driver
              </button>
            </div>
          </div>

          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <FaEnvelope className="text-sm" />
              </span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-4 py-3 bg-slate-950 border rounded-xl text-sm focus:outline-none transition-colors ${errors.email ? 'border-red-500/50 focus:border-red-500' : 'border-slate-800 focus:border-emerald-500/50'
                  }`}
                placeholder="you@example.com"
              />
            </div>
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
              <a href="#" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">Forgot Password?</a>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <FaLock className="text-sm" />
              </span>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-4 py-3 bg-slate-950 border rounded-xl text-sm focus:outline-none transition-colors ${errors.password ? 'border-red-500/50 focus:border-red-500' : 'border-slate-800 focus:border-emerald-500/50'
                  }`}
                placeholder="••••••••"
              />
            </div>
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || Object.keys(errors).some(k => errors[k])}
            className={`w-full py-3.5 mt-2 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/10 active:scale-98 transition-all font-display ${isLoading || Object.keys(errors).some(k => errors[k]) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
          >
            {isLoading ? 'Authenticating...' : 'Log In'}
          </button>
        </form>

        {/* Redirect section */}
        <div className="mt-8 text-center border-t border-slate-800/80 pt-6">
          <p className="text-sm text-slate-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
