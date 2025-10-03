import { create } from 'zustand';
import { authAPI } from '../services/api';
import type { AuthUser, LoginRequest, RegisterRequest } from '../types';

interface AuthStore {
  user: AuthUser | null;
  isLoading: boolean;
  login: (loginData: LoginRequest) => Promise<boolean>;
  register: (registerData: RegisterRequest) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isLoading: false,

  login: async (loginData: LoginRequest) => {
    set({ isLoading: true });
    try {
      const authResponse = await authAPI.login(loginData);
      const user: AuthUser = {
        userId: authResponse.userId,
        username: authResponse.username,
        email: authResponse.email,
        firstName: authResponse.firstName,
        lastName: authResponse.lastName,
        fullName: authResponse.fullName,
        roles: authResponse.roles,
        permissions: authResponse.permissions,
        isAuthenticated: true
      };

      set({ user, isLoading: false });
      return true;
    } catch (error) {
      console.error('Login error:', error);
      set({ user: null, isLoading: false });
      return false;
    }
  },

  register: async (registerData: RegisterRequest) => {
    set({ isLoading: true });
    try {
      const authResponse = await authAPI.register(registerData);
      const user: AuthUser = {
        userId: authResponse.userId,
        username: authResponse.username,
        email: authResponse.email,
        firstName: authResponse.firstName,
        lastName: authResponse.lastName,
        fullName: authResponse.fullName,
        roles: authResponse.roles,
        permissions: authResponse.permissions,
        isAuthenticated: true
      };

      set({ user, isLoading: false });
      return true;
    } catch (error) {
      console.error('Register error:', error);
      set({ user: null, isLoading: false });
      return false;
    }
  },

  logout: () => {
    authAPI.logout();
    set({ user: null });
  },

  checkAuth: () => {
    try {
      const token = localStorage.getItem('auth-token');
      const userStr = localStorage.getItem('auth-user');

      console.log('Auth check - Token exists:', !!token);
      console.log('Auth check - User data exists:', !!userStr);

      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          set({ user: { ...user, isAuthenticated: true } });
          console.log('Auth check - User restored:', user.username);
        } catch (parseError) {
          console.error('Auth check - Parse error:', parseError);
          localStorage.removeItem('auth-user');
          localStorage.removeItem('auth-token');
          localStorage.removeItem('auth-refresh-token');
          set({ user: null });
        }
      } else {
        console.log('Auth check - No valid auth data found');
        set({ user: null });
      }
    } catch (error) {
      console.error('Auth check error:', error);
      set({ user: null });
    }
  },

  initializeAuth: () => {
    get().checkAuth();
  }
}));