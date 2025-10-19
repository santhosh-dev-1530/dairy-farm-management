import axios from 'axios';
import { API_BASE_URL } from '../config/config';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.log('Unauthorized access - redirecting to login');
    }
    
    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  registerDevice: (fcmToken) => api.post('/auth/register-device', { fcmToken }),
};

export const cattleAPI = {
  getCattle: (params) => api.get('/cows', { params }),
  getCattleById: (id) => api.get(`/cows/${id}`),
  addCattle: (data) => api.post('/cows', data),
  updateCattle: (id, data) => api.put(`/cows/${id}`, data),
  deleteCattle: (id) => api.delete(`/cows/${id}`),
  assignCattle: (id, userId) => api.post(`/cows/${id}/assign`, { userId }),
  uploadPhoto: (id, photo) => {
    const formData = new FormData();
    formData.append('photo', {
      uri: photo.uri,
      type: photo.type,
      name: photo.fileName || 'photo.jpg',
    });
    return api.post(`/cows/${id}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const seminationAPI = {
  recordSemination: (data) => api.post('/semination', data),
  checkPregnancy: (id, data) => api.put(`/semination/${id}/check`, data),
  getSeminationHistory: (cattleId) => api.get(`/semination/cattle/${cattleId}`),
  getPendingChecks: () => api.get('/semination/pending-checks'),
};

export const pregnancyAPI = {
  getPregnancyRecords: (cattleId) => api.get(`/pregnancy/cattle/${cattleId}`),
  recordDelivery: (id, data) => api.put(`/pregnancy/${id}/delivery`, data),
  markSeparation: (id, data) => api.put(`/pregnancy/${id}/separation`, data),
  getPregnancyStats: () => api.get('/pregnancy/stats'),
};

export const feedingAPI = {
  recordFeeding: (data) => api.post('/feeding', data),
  getFeedingHistory: (cattleId, params) => api.get(`/feeding/cattle/${cattleId}`, { params }),
  getFeedingStats: (cattleId, params) => api.get(`/feeding/cattle/${cattleId}/stats`, { params }),
  batchRecordFeeding: (data) => api.post('/feeding/batch', data),
};

export const healthAPI = {
  recordHealthEvent: (data) => api.post('/health', data),
  getHealthHistory: (cattleId, params) => api.get(`/health/cattle/${cattleId}`, { params }),
  getHealthStats: (cattleId, params) => api.get(`/health/cattle/${cattleId}/stats`, { params }),
  getHealthAlerts: () => api.get('/health/alerts'),
};

export const notificationAPI = {
  getNotifications: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  registerDevice: (fcmToken) => api.post('/notifications/register-device', { fcmToken }),
};
