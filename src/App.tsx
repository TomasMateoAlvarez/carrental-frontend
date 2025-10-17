import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import esES from 'antd/locale/es_ES';
import { useAuthStore } from './stores/authStore';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import VehiclesPage from './pages/vehicles/VehiclesPage';
import ReservationsPage from './pages/reservations/ReservationsPage';
import ProtectedRoute from './components/ui/ProtectedRoute';
import AppLayout from './components/ui/AppLayout';
import { MaintenanceDashboard } from './components/maintenance/MaintenanceDashboard';
import { PermissionGuard } from './components/ui/PermissionGuard';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  const { checkAuth, initializeAuth } = useAuthStore();

  useEffect(() => {
    // Initialize auth on app startup
    initializeAuth();
  }, [initializeAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider locale={esES}>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Routes>
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/dashboard" element={<DashboardPage />} />
                      <Route path="/vehicles" element={<VehiclesPage />} />
                      <Route path="/reservations" element={<ReservationsPage />} />
                      <Route
                        path="/maintenance"
                        element={
                          <PermissionGuard
                            permission="MAINTENANCE_RECORD_MANAGE"
                            fallback={<Navigate to="/dashboard" replace />}
                          >
                            <MaintenanceDashboard />
                          </PermissionGuard>
                        }
                      />
                    </Routes>
                  </AppLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </ConfigProvider>
    </QueryClientProvider>
  );
}

export default App;