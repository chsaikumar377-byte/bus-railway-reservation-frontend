import apiClient from './client';

export const adminApi = {
  getDashboard: async () => {
    const response = await apiClient.get('/admin/dashboard');
    return response.data.data;
  },

  // Transports
  getTransports: async () => {
    const response = await apiClient.get('/admin/transports');
    return response.data.data;
  },
  createTransport: async (data) => {
    const response = await apiClient.post('/admin/transports', data);
    return response.data.data;
  },
  updateTransport: async (id, data) => {
    const response = await apiClient.put(`/admin/transports/${id}`, data);
    return response.data.data;
  },
  deleteTransport: async (id) => {
    const response = await apiClient.delete(`/admin/transports/${id}`);
    return response.data.data;
  },

  // Routes
  getRoutes: async () => {
    const response = await apiClient.get('/admin/routes');
    return response.data.data;
  },
  createRoute: async (data) => {
    const response = await apiClient.post('/admin/routes', data);
    return response.data.data;
  },
  updateRoute: async (id, data) => {
    const response = await apiClient.put(`/admin/routes/${id}`, data);
    return response.data.data;
  },
  deleteRoute: async (id) => {
    const response = await apiClient.delete(`/admin/routes/${id}`);
    return response.data.data;
  },

  // Schedules
  getSchedules: async () => {
    const response = await apiClient.get('/admin/schedules');
    return response.data.data;
  },
  createSchedule: async (data) => {
    const response = await apiClient.post('/admin/schedules', data);
    return response.data.data;
  },
  updateSchedule: async (id, data) => {
    const response = await apiClient.put(`/admin/schedules/${id}`, data);
    return response.data.data;
  },
  cancelSchedule: async (id) => {
    const response = await apiClient.delete(`/admin/schedules/${id}`);
    return response.data.data;
  },

  // Bookings
  getBookings: async () => {
    const response = await apiClient.get('/admin/bookings');
    return response.data.data;
  },

  // Users
  getUsers: async () => {
    const response = await apiClient.get('/admin/users');
    return response.data.data;
  },
  toggleUserStatus: async (id) => {
    const response = await apiClient.put(`/admin/users/${id}/toggle-status`);
    return response.data.data;
  },
};
