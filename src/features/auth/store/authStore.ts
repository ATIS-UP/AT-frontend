// legacy compatibility layer - delegates to the new auth.store
import { create } from 'zustand';
import { Rol } from '../../../shared/types/roles.types';
import { useAuthStore as useNewAuthStore } from './auth.store';

const TOKEN_KEY = 'sat_access_token';
const REFRESH_TOKEN_KEY = 'sat_refresh_token';
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

interface AuthUser {
  id: string;
  email: string;
  nombre: string;
}

interface AuthStore {
  user: AuthUser | null;
  rol: Rol | null;
  token: string | null;
  isAuthenticated: boolean;
  getRol: () => Rol | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  rol: null,
  token: null,
  isAuthenticated: false,
  getRol: () => get().rol,
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail ?? 'Login fallido');
      }

      const data = await response.json();
      const user = {
        id: data.usuario.id,
        email: data.usuario.email,
        nombre: data.usuario.nombre,
        rol: data.usuario.rol,
      };

      // sync with new store
      useNewAuthStore.getState().login(
        { access_token: data.access_token, refresh_token: data.refresh_token ?? '' },
        user,
      );

      set({
        user: { id: user.id, email: user.email, nombre: user.nombre },
        rol: data.usuario.rol,
        token: data.access_token,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  logout: async () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (e) {
      console.error(e);
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      set({ user: null, rol: null, token: null, isAuthenticated: false });
    }
  },
}));