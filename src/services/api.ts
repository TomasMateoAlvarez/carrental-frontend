import axios from 'axios';
import type { Vehicle, Client, VehicleRequest, ClientRequest } from '../types';

// Base API configuration
const API_BASE_URL = 'http://localhost:8083';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth headers
api.interceptors.request.use((config) => {
  const credentials = localStorage.getItem('auth-credentials');
  if (credentials) {
    config.headers.Authorization = `Basic ${credentials}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth-credentials');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (username: string, password: string): Promise<boolean> => {
    try {
      const credentials = btoa(`${username}:${password}`);
      const response = await axios.get(`${API_BASE_URL}/actuator/health`, {
        headers: {
          Authorization: `Basic ${credentials}`,
        },
      });

      if (response.status === 200) {
        localStorage.setItem('auth-credentials', credentials);
        localStorage.setItem('auth-user', username);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('auth-credentials');
    localStorage.removeItem('auth-user');
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('auth-credentials');
  },

  getCurrentUser: (): string | null => {
    return localStorage.getItem('auth-user');
  }
};

// Vehicles API
export const vehiclesAPI = {
  getAll: async (): Promise<Vehicle[]> => {
    const response = await api.get('/vehicles');
    return response.data;
  },

  getById: async (id: number): Promise<Vehicle> => {
    const response = await api.get(`/vehicles/${id}`);
    return response.data;
  },

  create: async (vehicle: VehicleRequest): Promise<Vehicle> => {
    const response = await api.post('/vehicles', vehicle);
    return response.data;
  },

  update: async (id: number, vehicle: VehicleRequest): Promise<Vehicle> => {
    const response = await api.put(`/vehicles/${id}`, vehicle);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/vehicles/${id}`);
  },

  getByStatus: async (status: string): Promise<Vehicle[]> => {
    const response = await api.get(`/vehicles/status/${status}`);
    return response.data;
  }
};

// Clients API
export const clientsAPI = {
  getAll: async (): Promise<Client[]> => {
    const response = await api.get('/clients');
    return response.data;
  },

  getById: async (id: number): Promise<Client> => {
    const response = await api.get(`/clients/${id}`);
    return response.data;
  },

  create: async (client: ClientRequest): Promise<Client> => {
    const response = await api.post('/clients', client);
    return response.data;
  },

  update: async (id: number, client: ClientRequest): Promise<Client> => {
    const response = await api.put(`/clients/${id}`, client);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/clients/${id}`);
  },

  search: async (query: string): Promise<Client[]> => {
    const response = await api.get(`/clients/search?q=${encodeURIComponent(query)}`);
    return response.data;
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