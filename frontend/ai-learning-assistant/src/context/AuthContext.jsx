import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';

// ─────────────────────────────────────────────────────────────────────────────
// AuthContext — global authentication state
// ─────────────────────────────────────────────────────────────────────────────

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,            setUser]            = useState(null);
  const [token,           setToken]           = useState(localStorage.getItem('token') || null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading,         setLoading]         = useState(true);  // true while verifying token

  // ── On mount: verify stored token is still valid ───────────────────────────
  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setLoading(false);
        return;
      }
      try {
        const response = await authService.getProfile();
        setUser(response.data);
        setToken(storedToken);
        setIsAuthenticated(true);
      } catch {
        // Token expired or invalid — clear everything
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  // ── Register ───────────────────────────────────────────────────────────────
  const register = async (userData) => {
    const response = await authService.register(userData);
    const { token: newToken, data: newUser } = response;
    if (newToken) {
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
      setIsAuthenticated(true);
    }
    return response;
  };

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = async (credentials) => {
    const response = await authService.login(credentials);
    const { token: newToken, data: newUser } = response;
    if (newToken) {
      setToken(newToken);
      setUser(newUser);
      setIsAuthenticated(true);
    }
    return response;
  };

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// useAuth hook — use this in any component
// ─────────────────────────────────────────────────────────────────────────────
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return context;
};

export default AuthContext;
