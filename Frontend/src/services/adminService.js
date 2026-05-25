import { api } from './api';

export const adminService = {
  getDashboardStats: async () => {
    return api.get('/admin/dashboard-stats');
  },

  getRecentActivity: async () => {
    return api.get('/admin/recent-activity');
  },

  getUsers: async ({ page = 1, limit = 10, search = '', status = '' } = {}) => {
    return api.get(`/admin/users?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&status=${status}`);
  },

  getDrivers: async ({ page = 1, limit = 10, search = '', verificationStatus = '', status = '', sortBy = 'newest' } = {}) => {
    return api.get(`/admin/drivers?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&verificationStatus=${verificationStatus}&status=${status}&sortBy=${sortBy}`);
  },

  updateVerificationStatus: async (driverId, { status, rejectionReason = '' }) => {
    return api.patch(`/admin/drivers/${driverId}/verify`, { status, rejectionReason });
  },

  toggleUserStatus: async (userId) => {
    return api.patch(`/admin/users/${userId}/toggle-status`);
  },

  getRevenueAnalytics: async () => {
    return api.get('/admin/revenue');
  },

  getRides: async ({ page = 1, limit = 10, search = '', status = '', filter = '', sortBy = 'newest' } = {}) => {
    return api.get(`/admin/rides?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&status=${status}&filter=${filter}&sortBy=${sortBy}`);
  }
};
