import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT access token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept 401s to attempt token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
            refresh: refreshToken,
          });
          const newAccess = res.data.access;
          localStorage.setItem('access_token', newAccess);
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return api(originalRequest);
        } catch (refreshErr) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login/', { email, password });
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/auth/register/', userData);
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/auth/profile/');
    return response.data;
  },
  updateProfile: async (userData) => {
    const response = await api.patch('/auth/profile/', userData);
    return response.data;
  },
  getStaffList: async (departmentId = null) => {
    const params = departmentId ? { department: departmentId } : {};
    const response = await api.get('/auth/staff/', { params });
    return response.data;
  },
  getUsers: async (params = {}) => {
    const response = await api.get('/auth/users/', { params });
    return response.data;
  },
};

export const departmentService = {
  getDepartments: async () => {
    const response = await api.get('/departments/departments/');
    return response.data;
  },
  getBuildings: async () => {
    const response = await api.get('/departments/buildings/');
    return response.data;
  },
  getClassrooms: async (buildingId = null) => {
    const params = buildingId ? { building: buildingId } : {};
    const response = await api.get('/departments/classrooms/', { params });
    return response.data;
  },
  lookupQR: async (token) => {
    const response = await api.get(`/departments/qr/lookup/${encodeURIComponent(token)}/`);
    return response.data;
  },
  createDepartment: async (data) => {
    const response = await api.post('/departments/departments/', data);
    return response.data;
  },
  createBuilding: async (data) => {
    const response = await api.post('/departments/buildings/', data);
    return response.data;
  },
  createClassroom: async (data) => {
    const response = await api.post('/departments/classrooms/', data);
    return response.data;
  },
};

export const issueService = {
  getIssues: async (params = {}) => {
    const response = await api.get('/issues/', { params });
    return response.data;
  },
  getIssueById: async (id) => {
    const response = await api.get(`/issues/${id}/`);
    return response.data;
  },
  createIssue: async (formData) => {
    const response = await api.post('/issues/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  updateIssue: async (id, data) => {
    const response = await api.patch(`/issues/${id}/`, data);
    return response.data;
  },
  updateIssueStatus: async (id, formDataOrJson) => {
    const isFormData = formDataOrJson instanceof FormData;
    const response = await api.post(`/issues/${id}/status/`, formDataOrJson, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },
  deleteIssue: async (id) => {
    const response = await api.delete(`/issues/${id}/`);
    return response.data;
  },
  upvoteIssue: async (id) => {
    const response = await api.post(`/issues/${id}/upvote/`);
    return response.data;
  },
  addComment: async (id, content) => {
    const response = await api.post(`/issues/${id}/comment/`, { content });
    return response.data;
  },
  checkDuplicates: async (params) => {
    const response = await api.get('/issues/check-duplicates/', { params });
    return response.data;
  },
  exportReportUrl: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const token = localStorage.getItem('access_token');
    return `${API_BASE_URL}/issues/export-report/?${query}&token=${token}`;
  },
  getExportReportJson: async (params = {}) => {
    const response = await api.get('/issues/export-report/', {
      params: { ...params, format: 'json' },
    });
    return response.data;
  },
};

export const notificationService = {
  getNotifications: async () => {
    const response = await api.get('/notifications/');
    return response.data;
  },
  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count/');
    return response.data;
  },
  markAsRead: async (id) => {
    const response = await api.patch(`/notifications/${id}/read/`);
    return response.data;
  },
  markAllRead: async () => {
    const response = await api.post('/notifications/mark-all-read/');
    return response.data;
  },
};

export const analyticsService = {
  getAnalytics: async () => {
    const response = await api.get('/admin/analytics/');
    return response.data;
  },
};

export default api;
