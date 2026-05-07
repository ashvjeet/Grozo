import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor for auth token
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('grozo_user') || 'null');
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Response interceptor for token refresh
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED' && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const user = JSON.parse(localStorage.getItem('grozo_user'));
        const { data } = await axios.post('/api/auth/refresh-token', { refreshToken: user.refreshToken });
        user.token = data.data.token;
        user.refreshToken = data.data.refreshToken;
        localStorage.setItem('grozo_user', JSON.stringify(user));
        originalRequest.headers.Authorization = `Bearer ${data.data.token}`;
        return API(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('grozo_user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
  addAddress: (data) => API.post('/auth/address', data),
  deleteAddress: (id) => API.delete(`/auth/address/${id}`),
  updatePantry: (data) => API.put('/auth/pantry', data),
};

// Products API
export const productsAPI = {
  getAll: (params) => API.get('/products', { params }),
  getOne: (id) => API.get(`/products/${id}`),
  getCategories: () => API.get('/products/categories'),
  getFlashDeals: () => API.get('/products/flash-deals'),
  getRecommendations: () => API.get('/products/recommendations'),
  optimizeBasket: (items) => API.post('/products/optimize-basket', { items }),
  generateMealPlan: (data) => API.post('/products/meal-planner', data),
  addReview: (id, data) => API.post(`/products/${id}/reviews`, data),
  // Admin
  create: (data) => API.post('/products', data),
  update: (id, data) => API.put(`/products/${id}`, data),
  delete: (id) => API.delete(`/products/${id}`),
};

// Cart API
export const cartAPI = {
  get: () => API.get('/cart'),
  add: (productId, quantity) => API.post('/cart/add', { productId, quantity }),
  update: (productId, quantity) => API.put('/cart/update', { productId, quantity }),
  remove: (productId) => API.delete(`/cart/remove/${productId}`),
  clear: () => API.delete('/cart/clear'),
  applyCoupon: (code) => API.post('/cart/apply-coupon', { code }),
  removeCoupon: () => API.delete('/cart/remove-coupon'),
};

// Orders API
export const ordersAPI = {
  place: (data) => API.post('/orders/place', data),
  getMyOrders: (params) => API.get('/orders/my-orders', { params }),
  getOrder: (id) => API.get(`/orders/${id}`),
  cancel: (id, reason) => API.put(`/orders/${id}/cancel`, { reason }),
  reorder: (id) => API.post(`/orders/${id}/reorder`),
  getSpendingInsights: () => API.get('/orders/spending-insights'),
  updateStatus: (id, data) => API.put(`/orders/${id}/status`, data),
  getActiveOrders: () => API.get('/orders/active'),
  downloadInvoice: (id) => API.get(`/orders/${id}/invoice`, { responseType: 'blob' }),
};

// Payment API
export const paymentAPI = {
  initiate: (data) => API.post('/payment/initiate', data),
  verifyOtp: (data) => API.post('/payment/verify-otp', data),
  callback: (data) => API.post('/payment/callback', data),
};

// Admin API
export const adminAPI = {
  getDashboard: () => API.get('/admin/dashboard'),
  getAllOrders: (params) => API.get('/admin/orders', { params }),
  getAnalytics: (params) => API.get('/admin/analytics', { params }),
  getUsers: (params) => API.get('/admin/users', { params }),
  getCoupons: () => API.get('/admin/coupons'),
  createCoupon: (data) => API.post('/admin/coupons', data),
  updateCoupon: (id, data) => API.put(`/admin/coupons/${id}`, data),
  deleteCoupon: (id) => API.delete(`/admin/coupons/${id}`),
};

export default API;
