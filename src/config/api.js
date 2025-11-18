// Configuración centralizada de API para CarRental

// URL base de la API (desde variables de entorno)
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8083/api/v1';

// URLs de endpoints
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  ME: '/auth/me',

  // Vehicles
  VEHICLES: '/vehicles',
  VEHICLES_AVAILABLE: '/vehicles/available',

  // Reservations
  RESERVATIONS: '/reservations',

  // Users (admin)
  USERS: '/users',

  // Maintenance
  MAINTENANCE: '/maintenance',

  // Dashboard
  DASHBOARD: '/dashboard/kpis',

  // Health check
  HEALTH: '/actuator/health'
};

// Configuración de axios
export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 segundos
  headers: {
    'Content-Type': 'application/json'
  }
};

// Helper para construir URLs completas
export const getApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

// Configuración de autenticación
export const AUTH_CONFIG = {
  tokenKey: import.meta.env.VITE_JWT_STORAGE_KEY || 'carrental_token',
  tokenPrefix: 'Bearer '
};

// Configuración de la app
export const APP_CONFIG = {
  name: import.meta.env.VITE_APP_NAME || 'CarRental SaaS',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  frontendUrl: import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173'
};

console.log('🔗 API configurada:', {
  baseUrl: API_BASE_URL,
  environment: import.meta.env.MODE
});
