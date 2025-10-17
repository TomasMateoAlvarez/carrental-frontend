import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Spin } from 'antd';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, checkAuth, isLoading, isInitialized } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    // Check auth only if not initialized and no user is present
    if (!isInitialized && !user) {
      console.log('🔐 No user found, checking authentication...');
      checkAuth();
    }
  }, [user, checkAuth, isInitialized]);

  // Show loading spinner while auth is being checked
  if (isLoading || !isInitialized) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <Spin size="large" />
      </div>
    );
  }

  // If no user after auth check, redirect to login
  if (!user || !user.isAuthenticated) {
    console.log('🚫 User not authenticated, redirecting to login...');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is authenticated, render protected content
  console.log('✅ User authenticated, rendering protected route for:', user.username);
  return <>{children}</>;
};

export default ProtectedRoute;