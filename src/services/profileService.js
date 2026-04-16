import axiosInstance from '@config/axiosInstance';

const profileService = {
  // Profile APIs
  getProfile: () => axiosInstance.get('/users/profile'),
  updateProfile: (formData) => axiosInstance.put('/users/profile', formData),
  changePassword: (data) => axiosInstance.put('/users/password', data),

  // Address APIs
  getAddresses: () => axiosInstance.get('/users/addresses'),
  addAddress: (data) => axiosInstance.post('/users/addresses', data),
  updateAddress: (id, data) => axiosInstance.put(`/users/addresses/${id}`, data),
  deleteAddress: (id) => axiosInstance.delete(`/users/addresses/${id}`),
  setDefaultAddress: (id) => axiosInstance.put(`/user/addresses/${id}/default`),

  // Order APIs
  getOrders: () => axiosInstance.get('/user/orders'),
  getOrderDetails: (id) => axiosInstance.get(`/user/orders/${id}`),
  reorder: (orderId) => axiosInstance.post(`/user/orders/${orderId}/reorder`),
};

export default profileService;

