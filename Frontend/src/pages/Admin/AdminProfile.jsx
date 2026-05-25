import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaCheckCircle, FaUserShield, FaBuilding, FaExclamationTriangle } from 'react-icons/fa';
import { userService } from '../../services/userService';
import { validatePhone, checkPasswordStrength } from '../../utils/auth';

function AdminProfile() {
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    sosContact: ''
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const res = await userService.getCurrentUser();
      if (res.success && res.user) {
        setProfileData({
          fullName: res.user.fullName || '',
          email: res.user.email || '',
          phone: res.user.phone || '',
          company: res.user.company || '',
          sosContact: res.user.sosContact || ''
        });
      }
    } catch (err) {
      console.error('Error fetching admin profile:', err);
      showFeedback('Failed to load profile data', true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileData.fullName.trim() || !profileData.phone.trim()) {
      showFeedback('Full name and phone number are required', true);
      return;
    }
    if (!validatePhone(profileData.phone)) {
      showFeedback('Please enter a valid 10-digit phone number', true);
      return;
    }
    if (profileData.sosContact && !validatePhone(profileData.sosContact)) {
      showFeedback('Please enter a valid SOS contact phone number', true);
      return;
    }

    setIsSavingProfile(true);
    try {
      const res = await userService.updateProfile({
        fullName: profileData.fullName,
        phone: profileData.phone,
        company: profileData.company,
        sosContact: profileData.sosContact
      });
      if (res.success) {
        showFeedback('Profile updated successfully');
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
      showFeedback(err.response?.data?.message || 'Failed to update profile details', true);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordData.newPassword.trim()) {
      showFeedback('Please enter a new password', true);
      return;
    }
    
    const pwdCheck = checkPasswordStrength(passwordData.newPassword);
    if (!pwdCheck.isValid) {
      showFeedback(pwdCheck.message, true);
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showFeedback('Passwords do not match', true);
      return;
    }

    setIsSavingPassword(true);
    try {
      const res = await userService.updateProfile({
        fullName: profileData.fullName,
        phone: profileData.phone,
        company: profileData.company,
        sosContact: profileData.sosContact,
        password: passwordData.newPassword
      });
      if (res.success) {
        showFeedback('Password changed successfully');
        setPasswordData({ newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      console.error('Failed to change password:', err);
      showFeedback(err.response?.data?.message || 'Failed to update password', true);
    } finally {
      setIsSavingPassword(false);
    }
  };

  const showFeedback = (msg, isError = false) => {
    setFeedback({ text: msg, isError });
    setTimeout(() => setFeedback(null), 4000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-400">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white font-display">Admin Account Settings</h1>
        <p className="text-xs text-slate-500">Configure administrative access details and credential parameters.</p>
      </div>

      {feedback && (
        <div className={`p-3.5 border rounded-2xl text-xs font-bold animate-fadeIn ${
          feedback.isError 
            ? 'bg-red-500/10 border-red-500/20 text-red-400' 
            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
        }`}>
          {feedback.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Profile Details Card */}
        <div className="md:col-span-7 bg-[#0d1020] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-850 pb-4">
            <FaUserShield className="text-indigo-400 text-base" />
            <div>
              <h2 className="text-sm font-bold text-white">System Admin Credentials</h2>
              <p className="text-[9px] text-slate-500 mt-0.5">Admin identity parameter settings</p>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                    className="w-full bg-[#070a13] border border-slate-800 focus:border-indigo-500 text-xs text-white p-3 pl-10 rounded-xl transition-all outline-none"
                    placeholder="Enter full name"
                  />
                  <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone Number</label>
                <div className="relative">
                  <input
                    type="text"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full bg-[#070a13] border border-slate-800 focus:border-indigo-500 text-xs text-white p-3 pl-10 rounded-xl transition-all outline-none"
                    placeholder="Enter phone number"
                  />
                  <FaPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
                </div>
              </div>
            </div>

            {/* Email (Disabled) */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1.5">
                Email Address <span className="text-[8px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded uppercase font-black">Locked</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={profileData.email}
                  disabled
                  className="w-full bg-[#0d1020]/20 border border-slate-850/80 text-xs text-slate-500 p-3 pl-10 rounded-xl outline-none cursor-not-allowed select-none"
                />
                <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 text-xs" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Company */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Company / Affiliation</label>
                <div className="relative">
                  <input
                    type="text"
                    value={profileData.company}
                    onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                    className="w-full bg-[#070a13] border border-slate-800 focus:border-indigo-500 text-xs text-white p-3 pl-10 rounded-xl transition-all outline-none"
                    placeholder="e.g. TaxiPool HQ"
                  />
                  <FaBuilding className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
                </div>
              </div>

              {/* SOS Contact */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">SOS Alert Contact</label>
                <div className="relative">
                  <input
                    type="text"
                    value={profileData.sosContact}
                    onChange={(e) => setProfileData({ ...profileData, sosContact: e.target.value })}
                    className="w-full bg-[#070a13] border border-slate-800 focus:border-indigo-500 text-xs text-white p-3 pl-10 rounded-xl transition-all outline-none"
                    placeholder="Emergency hotline"
                  />
                  <FaExclamationTriangle className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-850 pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-black transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-md shadow-indigo-500/10"
              >
                {isSavingProfile && <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                Update profile info
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="md:col-span-5 bg-[#0d1020] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-850 pb-4">
            <FaLock className="text-indigo-400 text-sm" />
            <div>
              <h2 className="text-sm font-bold text-white">System Passkey</h2>
              <p className="text-[9px] text-slate-500 mt-0.5">Change administrative passkey</p>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {/* New Password */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">New Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full bg-[#070a13] border border-slate-800 focus:border-indigo-500 text-xs text-white p-3 pl-10 rounded-xl transition-all outline-none"
                  placeholder="Min 6 characters"
                />
                <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confirm New Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full bg-[#070a13] border border-slate-800 focus:border-indigo-500 text-xs text-white p-3 pl-10 rounded-xl transition-all outline-none"
                  placeholder="Repeat new password"
                />
                <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
              </div>
            </div>

            <div className="border-t border-slate-850 pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSavingPassword}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-855 border border-slate-800 hover:border-indigo-500/30 text-indigo-400 rounded-xl text-xs font-black transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                {isSavingPassword && <span className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></span>}
                Update Passkey
              </button>
            </div>
          </form>
        </div>

      </div>

    </div>
  );
}

export default AdminProfile;
