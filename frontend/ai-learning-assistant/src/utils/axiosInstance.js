import axios from 'axios';

// ─────────────────────────────────────────────────────────────────────────────
// Axios instance — shared by every service file.
// Base URL is read from the VITE_API_URL env var (set in .env).
// ─────────────────────────────────────────────────────────────────────────────

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8003/api',
  timeout: 30000,                          // 30 s — AI endpoints can be slow
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor ──────────────────────────────────────────────────────
// Attach the JWT stored in localStorage to every outgoing request.
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor ─────────────────────────────────────────────────────
// • 401 → clear storage and redirect to /login (expired / invalid token)
// • All other errors → pass through so individual services can handle them
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
