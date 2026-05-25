import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaCarSide, FaIdCard, FaChair, FaCar } from 'react-icons/fa';
import { authService } from '../../services/authService';
import { validateEmail, validatePhone, checkPasswordStrength } from '../../utils/auth';

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    role: 'passenger', // passenger or driver
    // Driver specific fields
    vehicleName: '',
    vehicleNumber: '',
    licenseNumber: '',
    availableSeats: '3'
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

    // Common field validations
    if (!formData.fullName.trim()) tempErrors.fullName = "Full Name is required";

    if (!formData.email) {
      tempErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      tempErrors.email = "Please enter a valid email address";
    }

    if (!formData.phoneNumber) {
      tempErrors.phoneNumber = "Phone Number is required";
    } else if (!validatePhone(formData.phoneNumber)) {
      tempErrors.phoneNumber = "Please enter a valid 10-digit phone number";
    }

    if (!formData.password) {
      tempErrors.password = "Password is required";
    } else {
      const pwdStrength = checkPasswordStrength(formData.password);
      if (!pwdStrength.isValid) {
        tempErrors.password = pwdStrength.message;
      }
    }

    if (!formData.confirmPassword) {
      tempErrors.confirmPassword = "Confirm Password is required";
    } else if (formData.password !== formData.confirmPassword) {
      tempErrors.confirmPassword = "Passwords do not match";
    }

    // Driver specific validations
    if (formData.role === 'driver') {
      if (!formData.vehicleName.trim()) tempErrors.vehicleName = "Vehicle Name is required";
      if (!formData.vehicleNumber.trim()) tempErrors.vehicleNumber = "Vehicle Number is required";
      if (!formData.licenseNumber.trim()) tempErrors.licenseNumber = "License Number is required";

      const seats = parseInt(formData.availableSeats, 10);
      if (!formData.availableSeats) {
        tempErrors.availableSeats = "Seats count is required";
      } else if (isNaN(seats) || seats < 1 || seats > 8) {
        tempErrors.availableSeats = "Seats must be between 1 and 8";
      }
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setServerError('');

    const payload = {
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phoneNumber,
      password: formData.password,
      role: formData.role
    };

    if (formData.role === 'driver') {
      payload.vehicleName = formData.vehicleName;
      payload.vehicleNumber = formData.vehicleNumber;
      payload.licenseNumber = formData.licenseNumber;
      payload.availableSeats = parseInt(formData.availableSeats, 10);
    }

    try {
      const data = await authService.register(payload);

      // Save token and role in sessionStorage
      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('role', data.user.role);

      if (data.user.role === 'driver') {
        navigate('/driver');
      } else if (data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/passenger');
      }
    } catch (err) {
      setServerError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] flex flex-col justify-center items-center px-4 py-16 relative overflow-hidden text-slate-200">
      {/* Decorative background glows */}
      <div className="absolute top-1/10 right-1/4 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/10 left-1/4 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDuration: '6s' }}></div>

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

      {/* Signup Card */}
      <div className="w-full max-w-lg bg-gradient-to-b from-slate-900 to-[#0e1526] border border-slate-800 rounded-3xl p-8 shadow-2xl relative">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-t-3xl"></div>

        <h2 className="text-2xl font-extrabold text-white text-center font-display mb-2">Create Account</h2>
        <p className="text-slate-400 text-sm text-center mb-8 font-sans">
          Join TaxiPool to start sharing rides and saving money daily
        </p>

        {serverError && (
          <div className="p-3 bg-red-950/20 border border-red-500/20 text-red-400 text-xs font-bold rounded-xl animate-fadeIn mb-4">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Role Tab Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Join As</label>
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

          {/* Full Name */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <FaUser className="text-sm" />
              </span>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-4 py-3 bg-slate-950 border rounded-xl text-sm focus:outline-none transition-colors ${errors.fullName ? 'border-red-500/50 focus:border-red-500' : 'border-slate-800 focus:border-emerald-500/50'
                  }`}
                placeholder="John Doe"
              />
            </div>
            {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>}
          </div>

          {/* Grid fields for Email and Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email */}
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
                  placeholder="john@example.com"
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone Number</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <FaPhone className="text-sm" />
                </span>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 bg-slate-950 border rounded-xl text-sm focus:outline-none transition-colors ${errors.phoneNumber ? 'border-red-500/50 focus:border-red-500' : 'border-slate-800 focus:border-emerald-500/50'
                    }`}
                  placeholder="9876543210"
                />
              </div>
              {errors.phoneNumber && <p className="text-red-400 text-xs mt-1">{errors.phoneNumber}</p>}
            </div>
          </div>

          {/* Grid fields for Password and Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Password */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
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

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Confirm Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <FaLock className="text-sm" />
                </span>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 bg-slate-950 border rounded-xl text-sm focus:outline-none transition-colors ${errors.confirmPassword ? 'border-red-500/50 focus:border-red-500' : 'border-slate-800 focus:border-emerald-500/50'
                    }`}
                  placeholder="••••••••"
                />
              </div>
              {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>

          {/* Conditional Driver Fields */}
          {formData.role === 'driver' && (
            <div className="space-y-4 pt-4 border-t border-slate-800/80 animate-fadeIn">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Driver & Vehicle Details</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Vehicle Name */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vehicle Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                      <FaCar className="text-sm" />
                    </span>
                    <input
                      type="text"
                      name="vehicleName"
                      value={formData.vehicleName}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 bg-slate-950 border rounded-xl text-sm focus:outline-none transition-colors ${errors.vehicleName ? 'border-red-500/50 focus:border-red-500' : 'border-slate-800 focus:border-emerald-500/50'
                        }`}
                      placeholder="Maruti Swift / Honda City"
                    />
                  </div>
                  {errors.vehicleName && <p className="text-red-400 text-xs mt-1">{errors.vehicleName}</p>}
                </div>

                {/* Vehicle Number */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vehicle Number</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                      <FaIdCard className="text-sm" />
                    </span>
                    <input
                      type="text"
                      name="vehicleNumber"
                      value={formData.vehicleNumber}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 bg-slate-950 border rounded-xl text-sm focus:outline-none transition-colors ${errors.vehicleNumber ? 'border-red-500/50 focus:border-red-500' : 'border-slate-800 focus:border-emerald-500/50'
                        }`}
                      placeholder="TS 09 EX 1234"
                    />
                  </div>
                  {errors.vehicleNumber && <p className="text-red-400 text-xs mt-1">{errors.vehicleNumber}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* License Number */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">License Number</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                      <FaIdCard className="text-sm" />
                    </span>
                    <input
                      type="text"
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 bg-slate-950 border rounded-xl text-sm focus:outline-none transition-colors ${errors.licenseNumber ? 'border-red-500/50 focus:border-red-500' : 'border-slate-800 focus:border-emerald-500/50'
                        }`}
                      placeholder="DL-1420110012345"
                    />
                  </div>
                  {errors.licenseNumber && <p className="text-red-400 text-xs mt-1">{errors.licenseNumber}</p>}
                </div>

                {/* Available Seats */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Available Seats</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                      <FaChair className="text-sm" />
                    </span>
                    <input
                      type="number"
                      name="availableSeats"
                      min="1"
                      max="8"
                      value={formData.availableSeats}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 bg-slate-950 border rounded-xl text-sm focus:outline-none transition-colors ${errors.availableSeats ? 'border-red-500/50 focus:border-red-500' : 'border-slate-800 focus:border-emerald-500/50'
                        }`}
                      placeholder="3"
                    />
                  </div>
                  {errors.availableSeats && <p className="text-red-400 text-xs mt-1">{errors.availableSeats}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || Object.keys(errors).some(k => errors[k])}
            className={`w-full py-3.5 mt-4 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/10 active:scale-98 transition-all font-display ${isLoading || Object.keys(errors).some(k => errors[k]) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Redirect section */}
        <div className="mt-8 text-center border-t border-slate-800/80 pt-6">
          <p className="text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
