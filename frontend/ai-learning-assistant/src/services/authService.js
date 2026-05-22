import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';

// ─────────────────────────────────────────────────────────────────────────────
// Auth Service
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Register a new user.
 * @param {{ username: string, email: string, password: string }} data
 */
export const register = async (data) => {
  const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, data);
  return response.data;
};

/**
 * Log in an existing user.
 * Stores the returned token + user object in localStorage.
 * @param {{ email: string, password: string }} credentials
 */
export const login = async (credentials) => {
  const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, credentials);
  const { token, data: user } = response.data;
  if (token) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }
  return response.data;
};

/**
 * Fetch the currently logged-in user's profile.
 */
export const getProfile = async () => {
  const response = await axiosInstance.get(API_PATHS.AUTH.PROFILE);
  return response.data;
};

/**
 * Clear localStorage auth keys.
 * Prefer calling logout() from AuthContext instead — it also updates React state.
 */
export const clearAuthStorage = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};
