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
  User,
  VehiclePhoto,
  MaintenanceRecord,
  Notification,
  Customer,
  CustomerRequest,
  CustomerResponse,
  CustomerHistory,
  CustomerStatus,
  CustomerSegment
} from '../types';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8083';

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

      console.log('🔄 Received 401, attempting token refresh...');

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
          console.log('✅ Token refreshed successfully');
          return axios(originalRequest);
        } catch (refreshError) {
          console.error('❌ Token refresh failed:', refreshError);
          authAPI.logout();
          // Use React Router navigation instead of window.location
          setTimeout(() => {
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
          }, 100);
        }
      } else {
        console.log('⚠️ No refresh token available, redirecting to login');
        authAPI.logout();
        // Use React Router navigation instead of window.location
        setTimeout(() => {
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }, 100);
      }
    }

    // For other errors, don't automatically redirect
    if (error.response?.status !== 401) {
      console.log(`🚫 API Error ${error.response?.status}:`, error.response?.data?.message || error.message);
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

// Vehicle Photos API
export const vehiclePhotosAPI = {
  uploadPhoto: async (vehicleId: number, file: File, photoType: string, description?: string, inspectionType?: string): Promise<VehiclePhoto> => {
    const formData = new FormData();
    formData.append('vehicleId', vehicleId.toString());
    formData.append('file', file);
    formData.append('photoType', photoType);
    if (description) formData.append('description', description);
    if (inspectionType) formData.append('inspectionType', inspectionType);

    const response = await api.post('/api/v1/vehicle-photos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getVehiclePhotos: async (vehicleId: number): Promise<VehiclePhoto[]> => {
    const response = await api.get(`/api/v1/vehicle-photos/vehicle/${vehicleId}`);
    return response.data;
  },

  getGeneralPhotos: async (vehicleId: number): Promise<VehiclePhoto[]> => {
    const response = await api.get(`/api/v1/vehicle-photos/vehicle/${vehicleId}/general`);
    return response.data;
  },

  getPhotosByType: async (vehicleId: number, photoType: string): Promise<VehiclePhoto[]> => {
    const response = await api.get(`/api/v1/vehicle-photos/vehicle/${vehicleId}/type/${photoType}`);
    return response.data;
  },

  getInspectionPhotos: async (vehicleId: number, inspectionType: string): Promise<VehiclePhoto[]> => {
    const response = await api.get(`/api/v1/vehicle-photos/vehicle/${vehicleId}/inspection/${inspectionType}`);
    return response.data;
  },

  hasMinimumPhotos: async (vehicleId: number): Promise<boolean> => {
    const response = await api.get(`/api/v1/vehicle-photos/vehicle/${vehicleId}/has-minimum`);
    return response.data;
  },

  setPrimaryPhoto: async (photoId: number, vehicleId: number): Promise<void> => {
    await api.put(`/api/v1/vehicle-photos/${photoId}/set-primary?vehicleId=${vehicleId}`);
  },

  deletePhoto: async (photoId: number): Promise<void> => {
    await api.delete(`/api/v1/vehicle-photos/${photoId}`);
  }
};

// Maintenance API
export const maintenanceAPI = {
  createRecord: async (
    vehicleId: number,
    maintenanceType: string,
    description: string,
    serviceProvider: string,
    reason: string,
    cost: number,
    mileageAtService: number
  ): Promise<MaintenanceRecord> => {
    const formData = new URLSearchParams();
    formData.append('vehicleId', vehicleId.toString());
    formData.append('maintenanceType', maintenanceType);
    formData.append('description', description);
    formData.append('serviceProvider', serviceProvider);
    formData.append('reason', reason);
    formData.append('cost', cost.toString());
    formData.append('mileageAtService', mileageAtService.toString());

    const response = await api.post('/api/v1/maintenance/create', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  scheduleRecord: async (
    vehicleId: number,
    maintenanceType: string,
    description: string,
    scheduledDate: string,
    estimatedMileage: number
  ): Promise<MaintenanceRecord> => {
    const formData = new URLSearchParams();
    formData.append('vehicleId', vehicleId.toString());
    formData.append('maintenanceType', maintenanceType);
    formData.append('description', description);
    formData.append('scheduledDate', scheduledDate);
    formData.append('estimatedMileage', estimatedMileage.toString());

    const response = await api.post('/api/v1/maintenance/schedule', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  getVehicleHistory: async (vehicleId: number): Promise<MaintenanceRecord[]> => {
    const response = await api.get(`/api/v1/maintenance/vehicle/${vehicleId}`);
    return response.data;
  },

  getByStatus: async (status: string): Promise<MaintenanceRecord[]> => {
    const response = await api.get(`/api/v1/maintenance/status/${status}`);
    return response.data;
  },

  getUserRecords: async (): Promise<MaintenanceRecord[]> => {
    const response = await api.get('/api/v1/maintenance/user');
    return response.data;
  },

  updateRecord: async (
    recordId: number,
    status: string,
    completionDate?: string,
    notes?: string
  ): Promise<MaintenanceRecord> => {
    const params = new URLSearchParams({ status });
    if (completionDate) params.append('completionDate', completionDate);
    if (notes) params.append('notes', notes);

    const response = await api.put(`/api/v1/maintenance/${recordId}?${params}`);
    return response.data;
  },

  getVehiclesNeedingMaintenance: async (): Promise<Vehicle[]> => {
    const response = await api.get('/api/v1/maintenance/vehicles-needing-maintenance');
    return response.data;
  },

  getMaintenanceCount: async (vehicleId: number): Promise<number> => {
    const response = await api.get(`/api/v1/maintenance/vehicle/${vehicleId}/count`);
    return response.data;
  },

  deleteRecord: async (recordId: number): Promise<void> => {
    await api.delete(`/api/v1/maintenance/${recordId}`);
  },

  runManualCheck: async (): Promise<void> => {
    await api.post('/api/v1/maintenance/check-due');
  }
};

// Notifications API
export const notificationsAPI = {
  createNotification: async (
    userId: number,
    type: string,
    title: string,
    message: string,
    priority?: string,
    relatedEntityType?: string,
    relatedEntityId?: number
  ): Promise<Notification> => {
    const params = new URLSearchParams({
      userId: userId.toString(),
      type,
      title,
      message
    });
    if (priority) params.append('priority', priority);
    if (relatedEntityType) params.append('relatedEntityType', relatedEntityType);
    if (relatedEntityId) params.append('relatedEntityId', relatedEntityId.toString());

    const response = await api.post(`/api/v1/notifications/create?${params}`);
    return response.data;
  },

  getUserNotifications: async (): Promise<Notification[]> => {
    const response = await api.get('/api/v1/notifications/user');
    return response.data;
  },

  getUserNotificationsById: async (userId: number): Promise<Notification[]> => {
    const response = await api.get(`/api/v1/notifications/user/${userId}`);
    return response.data;
  },

  getUnreadNotifications: async (): Promise<Notification[]> => {
    const response = await api.get('/api/v1/notifications/user/unread');
    return response.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await api.get('/api/v1/notifications/user/unread/count');
    return response.data;
  },

  getNotificationsByType: async (type: string): Promise<Notification[]> => {
    const response = await api.get(`/api/v1/notifications/type/${type}`);
    return response.data;
  },

  getHighPriorityNotifications: async (): Promise<Notification[]> => {
    const response = await api.get('/api/v1/notifications/priority/high');
    return response.data;
  },

  markAsRead: async (notificationId: number): Promise<void> => {
    await api.put(`/api/v1/notifications/${notificationId}/mark-read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await api.put('/api/v1/notifications/user/mark-all-read');
  },

  deleteNotification: async (notificationId: number): Promise<void> => {
    await api.delete(`/api/v1/notifications/${notificationId}`);
  },

  cleanupExpired: async (): Promise<void> => {
    await api.post('/api/v1/notifications/cleanup-expired');
  }
};

// Customer API
export const customerAPI = {
  // Basic CRUD Operations
  getAll: async (page = 0, size = 20, sortBy = 'createdAt', sortDir = 'desc'): Promise<CustomerResponse[]> => {
    const response = await api.get(`/api/v1/customers?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`);
    return response.data;
  },

  getAllPaginated: async (page = 0, size = 20, sortBy = 'createdAt', sortDir = 'desc'): Promise<{ content: CustomerResponse[], totalElements: number, totalPages: number }> => {
    const response = await api.get(`/api/v1/customers/paginated?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`);
    return response.data;
  },

  getById: async (id: number): Promise<CustomerResponse> => {
    const response = await api.get(`/api/v1/customers/${id}`);
    return response.data;
  },

  getByCode: async (customerCode: string): Promise<CustomerResponse> => {
    const response = await api.get(`/api/v1/customers/code/${customerCode}`);
    return response.data;
  },

  create: async (customer: CustomerRequest): Promise<CustomerResponse> => {
    const response = await api.post('/api/v1/customers', customer);
    return response.data;
  },

  update: async (id: number, customer: CustomerRequest): Promise<CustomerResponse> => {
    const response = await api.put(`/api/v1/customers/${id}`, customer);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/v1/customers/${id}`);
  },

  // Customer History and Analytics
  getHistory: async (id: number): Promise<CustomerHistory> => {
    const response = await api.get(`/api/v1/customers/${id}/history`);
    return response.data;
  },

  updateStatistics: async (id: number): Promise<void> => {
    await api.put(`/api/v1/customers/${id}/update-statistics`);
  },

  // Search and Filter Operations
  search: async (searchTerm: string, page = 0, size = 20): Promise<{ content: CustomerResponse[], totalElements: number, totalPages: number }> => {
    const response = await api.get(`/api/v1/customers/search?searchTerm=${encodeURIComponent(searchTerm)}&page=${page}&size=${size}`);
    return response.data;
  },

  getByStatus: async (status: CustomerStatus): Promise<CustomerResponse[]> => {
    const response = await api.get(`/api/v1/customers/status/${status}`);
    return response.data;
  },

  getBySegment: async (segment: CustomerSegment): Promise<CustomerResponse[]> => {
    const response = await api.get(`/api/v1/customers/segment/${segment}`);
    return response.data;
  },

  getWithExpiringLicenses: async (daysAhead = 30): Promise<CustomerResponse[]> => {
    const response = await api.get(`/api/v1/customers/expiring-licenses?daysAhead=${daysAhead}`);
    return response.data;
  },

  getTopCustomers: async (criteria = 'spending', limit = 10): Promise<CustomerResponse[]> => {
    const response = await api.get(`/api/v1/customers/top-customers?criteria=${criteria}&limit=${limit}`);
    return response.data;
  },

  // Customer Analytics Endpoints
  getSegmentAnalytics: async (): Promise<any> => {
    const response = await api.get('/api/v1/customers/analytics/segments');
    return response.data;
  },

  getSpendingAnalytics: async (): Promise<any> => {
    const response = await api.get('/api/v1/customers/analytics/spending');
    return response.data;
  },

  getActivityAnalytics: async (): Promise<any> => {
    const response = await api.get('/api/v1/customers/analytics/activity');
    return response.data;
  },

  // Utility Endpoints
  validateEmailAvailability: async (email: string): Promise<boolean> => {
    const response = await api.get(`/api/v1/customers/validate/email?email=${encodeURIComponent(email)}`);
    return response.data;
  },

  validateLicenseAvailability: async (licenseNumber: string): Promise<boolean> => {
    const response = await api.get(`/api/v1/customers/validate/license?licenseNumber=${encodeURIComponent(licenseNumber)}`);
    return response.data;
  },

  // Customer Engagement Endpoints
  sendNotification: async (id: number, message: string): Promise<string> => {
    const response = await api.post(`/api/v1/customers/${id}/send-notification`, message, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
    return response.data;
  },

  getEngagementScore: async (id: number): Promise<any> => {
    const response = await api.get(`/api/v1/customers/${id}/engagement-score`);
    return response.data;
  }
};

export default api;