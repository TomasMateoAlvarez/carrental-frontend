import axios from 'axios';
import type {
  Vehicle,
  VehicleRequest,
  VehicleStatus,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  AuthUser,
  CreateReservationRequest,
  ReservationResponse,
  User
} from '../types';

// Base API configuration
const API_BASE_URL = 'http://localhost:8083';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT auth headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('auth-refresh-token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {}, {
            headers: { Authorization: `Bearer ${refreshToken}` }
          });

          const { token, refreshToken: newRefreshToken } = response.data;
          localStorage.setItem('auth-token', token);
          localStorage.setItem('auth-refresh-token', newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axios(originalRequest);
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          authAPI.logout();
          window.location.href = '/login';
        }
      } else {
        console.log('No refresh token available, redirecting to login');
        authAPI.logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (loginData: LoginRequest): Promise<AuthResponse> => {
    const response = await axios.post(`${API_BASE_URL}/api/v1/auth/login`, loginData);
    const authResponse: AuthResponse = response.data;

    // Store tokens and user data
    localStorage.setItem('auth-token', authResponse.token);
    localStorage.setItem('auth-refresh-token', authResponse.refreshToken);
    localStorage.setItem('auth-user', JSON.stringify({
      userId: authResponse.userId,
      username: authResponse.username,
      email: authResponse.email,
      firstName: authResponse.firstName,
      lastName: authResponse.lastName,
      fullName: authResponse.fullName,
      roles: authResponse.roles,
      permissions: authResponse.permissions,
      isAuthenticated: true
    }));

    return authResponse;
  },

  register: async (registerData: RegisterRequest): Promise<AuthResponse> => {
    const response = await axios.post(`${API_BASE_URL}/api/v1/auth/register`, registerData);
    const authResponse: AuthResponse = response.data;

    // Store tokens and user data (auto-login after registration)
    localStorage.setItem('auth-token', authResponse.token);
    localStorage.setItem('auth-refresh-token', authResponse.refreshToken);
    localStorage.setItem('auth-user', JSON.stringify({
      userId: authResponse.userId,
      username: authResponse.username,
      email: authResponse.email,
      firstName: authResponse.firstName,
      lastName: authResponse.lastName,
      fullName: authResponse.fullName,
      roles: authResponse.roles,
      permissions: authResponse.permissions,
      isAuthenticated: true
    }));

    return authResponse;
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/api/v1/auth/logout');
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      localStorage.removeItem('auth-token');
      localStorage.removeItem('auth-refresh-token');
      localStorage.removeItem('auth-user');
    }
  },

  refreshToken: async (): Promise<AuthResponse> => {
    const refreshToken = localStorage.getItem('auth-refresh-token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {}, {
      headers: { Authorization: `Bearer ${refreshToken}` }
    });

    const authResponse: AuthResponse = response.data;
    localStorage.setItem('auth-token', authResponse.token);
    localStorage.setItem('auth-refresh-token', authResponse.refreshToken);

    return authResponse;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('auth-token');
  },

  getCurrentUser: (): AuthUser | null => {
    const userStr = localStorage.getItem('auth-user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        return null;
      }
    }
    return null;
  },

  hasRole: (role: string): boolean => {
    const user = authAPI.getCurrentUser();
    return user?.roles.includes(role) ?? false;
  },

  hasPermission: (permission: string): boolean => {
    const user = authAPI.getCurrentUser();
    return user?.permissions.includes(permission) ?? false;
  },

  isAdmin: (): boolean => {
    return authAPI.hasRole('ADMIN');
  }
};

// Vehicles API
export const vehiclesAPI = {
  getAll: async (): Promise<Vehicle[]> => {
    const response = await api.get('/api/v1/vehicles');
    return response.data;
  },

  getById: async (id: number): Promise<Vehicle> => {
    const response = await api.get(`/api/v1/vehicles/${id}`);
    return response.data;
  },

  create: async (vehicle: VehicleRequest): Promise<Vehicle> => {
    const response = await api.post('/api/v1/vehicles', vehicle);
    return response.data;
  },

  update: async (id: number, vehicle: VehicleRequest): Promise<Vehicle> => {
    const response = await api.put(`/api/v1/vehicles/${id}`, vehicle);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/v1/vehicles/${id}`);
  },

  getByStatus: async (status: string): Promise<Vehicle[]> => {
    const response = await api.get(`/api/v1/vehicles/status/${status}`);
    return response.data;
  },

  changeStatus: async (id: number, status: VehicleStatus): Promise<Vehicle> => {
    const response = await api.patch(`/api/v1/vehicles/${id}/status?status=${status}`);
    return response.data;
  },

  getAvailable: async (): Promise<Vehicle[]> => {
    const response = await api.get('/api/v1/vehicles/available');
    return response.data;
  }
};

// Reservations API
export const reservationsAPI = {
  getAll: async (): Promise<ReservationResponse[]> => {
    const response = await api.get('/api/v1/reservations/all');
    return response.data;
  },

  getById: async (id: number): Promise<ReservationResponse> => {
    const response = await api.get(`/api/v1/reservations/${id}`);
    return response.data;
  },

  create: async (reservation: CreateReservationRequest): Promise<ReservationResponse> => {
    const response = await api.post('/api/v1/reservations', reservation);
    return response.data;
  },

  update: async (id: number, status: string): Promise<ReservationResponse> => {
    const response = await api.put(`/api/v1/reservations/${id}/status?status=${status}`);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/v1/reservations/${id}`);
  },

  getMyReservations: async (): Promise<ReservationResponse[]> => {
    const response = await api.get('/api/v1/reservations/my');
    return response.data;
  },

  // New advanced methods
  getByStatus: async (status: string): Promise<ReservationResponse[]> => {
    const response = await api.get(`/api/v1/reservations/admin/status/${status}`);
    return response.data;
  },

  getPickupsForDate: async (date: string): Promise<ReservationResponse[]> => {
    const response = await api.get(`/api/v1/reservations/admin/pickups/${date}`);
    return response.data;
  },

  getReturnsForDate: async (date: string): Promise<ReservationResponse[]> => {
    const response = await api.get(`/api/v1/reservations/admin/returns/${date}`);
    return response.data;
  },

  checkAvailability: async (vehicleId: number, startDate: string, endDate: string): Promise<{ available: boolean }> => {
    const response = await api.get(`/api/v1/reservations/check-availability?vehicleId=${vehicleId}&startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  },

  confirmReservation: async (reservationCode: string): Promise<ReservationResponse> => {
    const response = await api.post(`/api/v1/reservations/${reservationCode}/confirm`);
    return response.data;
  },

  cancelReservation: async (reservationCode: string, reason?: string): Promise<ReservationResponse> => {
    const response = await api.post(`/api/v1/reservations/${reservationCode}/cancel`, { reason });
    return response.data;
  }
};

// Users API (for admin)
export const usersAPI = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
  },

  create: async (user: User): Promise<User> => {
    const response = await api.post('/users', user);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  }
};

// Health API
export const healthAPI = {
  getHealth: async () => {
    const response = await api.get('/actuator/health');
    return response.data;
  },

  getInfo: async () => {
    const response = await api.get('/actuator/info');
    return response.data;
  }
};

export default api;