import apiClient from './client';

export const bookingApi = {
  create: async (bookingData) => {
    const response = await apiClient.post('/bookings', bookingData);
    return response.data.data;
  },

  getMyBookings: async () => {
    const response = await apiClient.get('/bookings/my');
    return response.data.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/bookings/${id}`);
    return response.data.data;
  },

  getByReference: async (reference) => {
    const response = await apiClient.get(`/bookings/reference/${reference}`);
    return response.data.data;
  },

  cancel: async (id, reason) => {
    const response = await apiClient.post(`/bookings/${id}/cancel`, { reason });
    return response.data.data;
  },
};
