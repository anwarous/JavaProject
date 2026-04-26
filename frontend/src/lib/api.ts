import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach Bearer token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor: auto-refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const res = await axios.post(`${API_URL}/api/auth/refresh`, { refreshToken });
          const { accessToken, refreshToken: newRefresh } = res.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefresh);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        if (typeof window !== 'undefined') {
          window.location.href = '/auth';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ===================== API Functions =====================

// Auth
export const authAPI = {
  register: (data: any) => api.post('/api/auth/register', data),
  login: (data: any) => api.post('/api/auth/login', data),
  refresh: (data: any) => api.post('/api/auth/refresh', data),
  logout: () => api.post('/api/auth/logout'),
};

// Products
export const productsAPI = {
  getAll: (params?: any) => api.get('/api/products', { params }),
  getById: (id: number) => api.get(`/api/products/${id}`),
  create: (data: any) => api.post('/api/products', data),
  update: (id: number, data: any) => api.put(`/api/products/${id}`, data),
  delete: (id: number) => api.delete(`/api/products/${id}`),
  search: (q: string, params?: any) => api.get('/api/products/search', { params: { q, ...params } }),
  topSelling: () => api.get('/api/products/top-selling'),
};

// Categories
export const categoriesAPI = {
  getTree: () => api.get('/api/categories'),
  create: (data: any) => api.post('/api/categories', data),
  update: (id: number, data: any) => api.put(`/api/categories/${id}`, data),
  delete: (id: number) => api.delete(`/api/categories/${id}`),
};

// Cart
export const cartAPI = {
  get: () => api.get('/api/cart'),
  addItem: (data: any) => api.post('/api/cart/items', data),
  updateItem: (itemId: number, data: any) => api.put(`/api/cart/items/${itemId}`, data),
  removeItem: (itemId: number) => api.delete(`/api/cart/items/${itemId}`),
  applyCoupon: (code: string) => api.post('/api/cart/coupon', { code }),
  removeCoupon: () => api.delete('/api/cart/coupon'),
};

// Orders
export const ordersAPI = {
  place: (data: any) => api.post('/api/orders', data),
  getById: (id: number) => api.get(`/api/orders/${id}`),
  myOrders: (params?: any) => api.get('/api/orders/my', { params }),
  allOrders: (params?: any) => api.get('/api/orders', { params }),
  sellerOrders: (params?: any) => api.get('/api/orders/seller', { params }),
  updateStatus: (id: number, status: string) => api.put(`/api/orders/${id}/status`, { status }),
  cancel: (id: number) => api.put(`/api/orders/${id}/cancel`),
};

// Reviews
export const reviewsAPI = {
  create: (data: any) => api.post('/api/reviews', data),
  getByProduct: (productId: number, params?: any) => api.get(`/api/reviews/product/${productId}`, { params }),
  approve: (id: number) => api.put(`/api/reviews/${id}/approve`),
};

// Dashboard
export const dashboardAPI = {
  admin: () => api.get('/api/dashboard/admin'),
  seller: () => api.get('/api/dashboard/seller'),
};

// Coupons
export const couponsAPI = {
  getAll: () => api.get('/api/coupons'),
  create: (data: any) => api.post('/api/coupons', data),
  validate: (code: string) => api.get(`/api/coupons/validate/${code}`),
};

// Addresses
export const addressesAPI = {
  getAll: () => api.get('/api/addresses'),
  create: (data: any) => api.post('/api/addresses', data),
  delete: (id: number) => api.delete(`/api/addresses/${id}`),
};
