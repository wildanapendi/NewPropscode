import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach JWT token and maintenance bypass
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('propscode_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const bypassToken = localStorage.getItem('propscode_maintenance_bypass');
  if (bypassToken) {
    config.headers['X-Maintenance-Bypass'] = bypassToken;
  }

  return config;
});

// Response interceptor — handle 401 and 503 Maintenance
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const isMaintenance = error.response?.data?.maintenance === true || status === 503;

    if (isMaintenance && window.location.pathname !== '/maintenance') {
      window.location.href = '/maintenance';
    } else if (status === 401) {
      localStorage.removeItem('propscode_token');
      localStorage.removeItem('propscode_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const baseUrl = API_BASE_URL.replace('/api', '');
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
};

export default api;
