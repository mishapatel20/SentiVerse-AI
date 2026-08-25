import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sentiverse_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to catch 401s
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('sentiverse_token');
      localStorage.removeItem('sentiverse_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// API Service Functions
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

export const predictAPI = {
  analyzeSingle: (review_text) => api.post('/predict', { review_text }),
  analyzeBulk: (formData) => api.post('/predict/bulk', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  analyzeBulkJSON: (data) => api.post('/predict/bulk', data),
};

export const historyAPI = {
  getHistory: (params) => api.get('/history', { params }),
  deletePrediction: (id) => api.delete(`/history/${id}`),
  clearHistory: () => api.delete('/history/clear'),
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getAnalytics: () => api.get('/analytics'),
};

export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getUploads: () => api.get('/admin/uploads'),
  getStats: () => api.get('/admin/stats'),
  getLogs: () => api.get('/admin/logs'),
};

export const translateAPI = {
  translateText: (data) => api.post('/translate', data),
  translateBulk: (data) => api.post('/translate/bulk', data),
  getLanguages: () => api.get('/translate/languages'),
};

export const reportAPI = {
  getSummary: () => api.get('/report/summary'),
  generatePDF: (data) => api.post('/report/generate', data, { responseType: 'blob' }),
};

export default api;
