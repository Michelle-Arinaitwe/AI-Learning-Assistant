import React from 'react'
import { Outlet } from 'react-router-dom';
import AppLayout from '../layout/AppLayout';

const ProtectedRoute = () => {
    const isAuthenticated = true; // This should come from your auth context or state
    const loading = false;

    if (loading) {
        return 
        <div>Loading...</div>;
    }
  return isAuthenticated ? (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ) : (
    <Navigate to="/login" replace />
  );
}

export default ProtectedRoute;