import { create } from 'zustand';
import { authAPI } from '../services/api';
import type { AuthUser, LoginRequest, RegisterRequest } from '../types/index';

interface AuthStore {
  user: AuthUser | null;
  isLoading: boolean;
  isInitialized: boolean;
  login: (loginData: LoginRequest) => Promise<boolean>;
  register: (registerData: RegisterRequest) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  initializeAuth: () => void;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  isAdmin: () => boolean;
  isEmployee: () => boolean;
  isCustomer: () => boolean;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isLoading: false,
  isInitialized: false,

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
    localStorage.removeItem('auth-user');
    localStorage.removeItem('auth-token');
    localStorage.removeItem('auth-refresh-token');
    set({ user: null, isInitialized: false });
  },

  checkAuth: async () => {
    try {
      const token = localStorage.getItem('auth-token');

      if (!token) {
        console.log('⚠️ No auth token found, user needs to login');
        set({ user: null, isInitialized: true });
        return;
      }

      set({ isLoading: true });

      // Validate token with backend /me endpoint
      try {
        const response = await fetch('http://localhost:8083/api/v1/auth/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const authResponse = await response.json();
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

          // Update stored user data
          localStorage.setItem('auth-user', JSON.stringify(user));
          set({ user, isLoading: false, isInitialized: true });
          console.log('✅ Auth validated for user:', user.username);
        } else {
          console.log('❌ Token validation failed, clearing auth data');
          localStorage.removeItem('auth-user');
          localStorage.removeItem('auth-token');
          localStorage.removeItem('auth-refresh-token');
          set({ user: null, isLoading: false, isInitialized: true });
        }
      } catch (apiError) {
        console.error('❌ Auth validation API error:', apiError);
        // More robust fallback - keep user authenticated if we have cached data and token
        const userStr = localStorage.getItem('auth-user');
        if (userStr && token) {
          try {
            const userData = JSON.parse(userStr);
            const user: AuthUser = {
              ...userData,
              isAuthenticated: true
            };
            set({ user, isLoading: false, isInitialized: true });
            console.log('⚠️ Using cached auth data for user (API unavailable):', user.username);
          } catch (parseError) {
            console.error('❌ Cached auth data parse error:', parseError);
            localStorage.removeItem('auth-user');
            localStorage.removeItem('auth-token');
            localStorage.removeItem('auth-refresh-token');
            set({ user: null, isLoading: false, isInitialized: true });
          }
        } else {
          set({ user: null, isLoading: false, isInitialized: true });
        }
      }
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      // Don't clear auth on general errors - keep cached data if available
      const userStr = localStorage.getItem('auth-user');
      const token = localStorage.getItem('auth-token');
      if (userStr && token) {
        try {
          const userData = JSON.parse(userStr);
          const user: AuthUser = {
            ...userData,
            isAuthenticated: true
          };
          set({ user, isLoading: false, isInitialized: true });
          console.log('⚠️ Keeping cached auth data due to error:', user.username);
        } catch (parseError) {
          set({ user: null, isLoading: false, isInitialized: true });
        }
      } else {
        set({ user: null, isLoading: false, isInitialized: true });
      }
    }
  },

  initializeAuth: () => {
    const { isInitialized, isLoading } = get();
    if (isInitialized || isLoading) {
      console.log('🔄 Auth already initialized or loading, skipping...');
      return;
    }

    // Try to load from localStorage first
    const userStr = localStorage.getItem('auth-user');
    const token = localStorage.getItem('auth-token');

    if (userStr && token) {
      try {
        const userData = JSON.parse(userStr);
        const user: AuthUser = {
          ...userData,
          isAuthenticated: true
        };
        set({ user, isInitialized: true });
        console.log('✅ Auth loaded from cache for user:', user.username);

        // Optionally validate with backend in background
        setTimeout(() => {
          get().checkAuth();
        }, 100);
        return;
      } catch (error) {
        console.error('❌ Failed to parse cached auth data:', error);
        localStorage.removeItem('auth-user');
        localStorage.removeItem('auth-token');
        localStorage.removeItem('auth-refresh-token');
      }
    }

    // If no valid cache, validate with backend
    set({ isInitialized: true });
    get().checkAuth();
  },

  hasRole: (role: string) => {
    const { user } = get();
    return user?.roles?.includes(role) || false;
  },

  hasPermission: (permission: string) => {
    const { user } = get();
    return user?.permissions?.includes(permission) || false;
  },

  isAdmin: () => {
    return get().hasRole('ADMIN');
  },

  isEmployee: () => {
    return get().hasRole('EMPLOYEE');
  },

  isCustomer: () => {
    return get().hasRole('CUSTOMER');
  }
}));