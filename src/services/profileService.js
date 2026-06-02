import axiosInstance from '@config/axiosInstance';

const profileService = {
  getProfile: (config = {}) => axiosInstance.get('/api/user/profile', config),
  updateProfile: (formData, config = {}) => axiosInstance.put('/api/user/profile', formData, config),
  changePassword: (data, config = {}) => axiosInstance.put('/api/user/password', data, config),

  getAddresses: () => axiosInstance.get('/api/user/addresses'),
  addAddress: (data) => axiosInstance.post('/api/user/addresses', data),
  updateAddress: (id, data) => axiosInstance.put(`/api/user/addresses/${id}`, data),
  deleteAddress: (id) => axiosInstance.delete(`/api/user/addresses/${id}`),
  setDefaultAddress: (id) => axiosInstance.put(`/api/user/addresses/${id}/default`),

  getOrders: () => axiosInstance.get('/api/user/orders'),
  getOrderDetails: (id) => axiosInstance.get(`/api/user/orders/${id}`),
  reorder: (orderId) => axiosInstance.post(`/api/user/orders/${orderId}/reorder`),
};

export default profileService;

