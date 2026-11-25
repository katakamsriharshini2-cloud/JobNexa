import axios from 'axios';

// In production (Render/Vercel): VITE_API_BASE_URL is set to full backend URL e.g. https://xyz.onrender.com/api
// In development: VITE_API_BASE_URL is undefined or localhost, and Vite's proxy forwards /api → localhost:5000/api
const normalizeApiUrl = (url) => {
  if (!url || typeof url !== 'string' || url.includes('localhost')) {
    // Development mode: use relative path, Vite proxy handles forwarding to backend
    return '/api';
  }
  const clean = url.trim().replace(/\/+$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
};

const API_BASE_URL = normalizeApiUrl(import.meta.env.VITE_API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jobnexa_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized, clear token only if token existed
      const currentToken = localStorage.getItem('jobnexa_token');
      if (currentToken && !window.location.pathname.includes('/login')) {
        localStorage.removeItem('jobnexa_token');
        localStorage.removeItem('jobnexa_user');
        window.location.href = '/login?sessionExpired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
