import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import RegisterPage       from './pages/Auth/RegisterPage';
import LoginPage          from './pages/Auth/LoginPage';
import NotFoundPage       from './pages/NotFoundPage';
import ProtectedRoute     from './components/auth/ProtectedRoute';
import DashboardPage      from './pages/Dashboard/DashboardPage';
import DocumentListPage   from './pages/Documents/DocumentListPage';
import DocumentDetailPage from './pages/Documents/DocumentDetailPage';
import FlashcardListPage  from './pages/FlashCards/FlashcardListPage';
import FlashcardPage      from './pages/FlashCards/FlashcardPage';
import QuizTakePage       from './pages/Quizzes/QuizTakePage';
import QuizResultPage     from './pages/Quizzes/QuizResultPage';
import ProfilePage        from './pages/Profile/ProfilePage';

// ─────────────────────────────────────────────────────────────────────────────
// AppRoutes — lives inside AuthProvider so useAuth() is available
// ─────────────────────────────────────────────────────────────────────────────
const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <Routes>
      {/* Root redirect */}
      <Route
        path="/"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
      />

      {/* Public routes */}
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard"                    element={<DashboardPage />} />
        <Route path="/documents"                    element={<DocumentListPage />} />
        <Route path="/documents/:id"                element={<DocumentDetailPage />} />
        <Route path="/flashcards"                   element={<FlashcardListPage />} />
        <Route path="/documents/:id/flashcards"     element={<FlashcardPage />} />
        <Route path="/quizzes/:quizId"              element={<QuizTakePage />} />
        <Route path="/quizzes/:quizId/results"      element={<QuizResultPage />} />
        <Route path="/profile"                      element={<ProfilePage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// App — wraps everything with AuthProvider and Router
// ─────────────────────────────────────────────────────────────────────────────
const App = () => (
  <AuthProvider>
    <Router>
      <AppRoutes />
    </Router>
  </AuthProvider>
);

export default App;
