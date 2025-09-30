import { create } from 'zustand';
import { authAPI } from '../services/api';
import type { AuthUser } from '../types';

interface AuthStore {
  user: AuthUser | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: false,

  login: async (username: string, password: string) => {
    set({ isLoading: true });
    try {
      const success = await authAPI.login(username, password);
      if (success) {
        const user = {
          username,
          isAuthenticated: true
        };
        set({
          user,
          isLoading: false
        });
        localStorage.setItem('auth-user-store', JSON.stringify({ user }));
        return true;
      } else {
        set({ user: null, isLoading: false });
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      set({ user: null, isLoading: false });
      return false;
    }
  },

  logout: () => {
    authAPI.logout();
    set({ user: null });
    localStorage.removeItem('auth-user-store');
  },

  checkAuth: () => {
    try {
      const storedAuth = localStorage.getItem('auth-user-store');
      if (storedAuth) {
        const parsed = JSON.parse(storedAuth);
        if (parsed.user) {
          set({ user: parsed.user });
          return;
        }
      }

      const isAuthenticated = authAPI.isAuthenticated();
      const currentUser = authAPI.getCurrentUser();

      if (isAuthenticated && currentUser) {
        const user = {
          username: currentUser,
          isAuthenticated: true
        };
        set({ user });
        localStorage.setItem('auth-user-store', JSON.stringify({ user }));
      } else {
        set({ user: null });
        localStorage.removeItem('auth-user-store');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      set({ user: null });
    }
  }
}));