import { create } from 'zustand';
import { Rol } from '../../../shared/types/roles.types';
import { apiClient } from '@/src/lib/api-client';

const TOKEN_KEY = 'sat_access_token';
const REFRESH_TOKEN_KEY = 'sat_refresh_token';
const API_URL = import.meta.env.VITE_API_URL ?? '';

interface AuthUser {
  id: string;
  email: string;
  nombre: string;
  rol: Rol;
}

interface Tokens {
  access_token: string;
  refresh_token: string;
}

interface LoginResponse {
  access_token: string;
  refresh_token?: string;
  usuario: {
    id: string;
    email: string;
    nombre: string;
    rol: Rol;
  };
}

interface AuthStore {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (tokens: Tokens, user: AuthUser) => void;
  loginWithCredentials: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: (tokens, user) => {
    localStorage.setItem(TOKEN_KEY, tokens.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
    set({ user, isAuthenticated: true, isLoading: false });
  },

  loginWithCredentials: async (email, password): Promise<AuthUser> => {
    const fullEmail = email.includes('@') ? email : `${email}@unipamplona.edu.co`;
    
    try {
      const data = await apiClient.post<LoginResponse>('/api/auth/login', { 
        email: fullEmail, 
        password 
      });
      
      localStorage.setItem(TOKEN_KEY, data.access_token);
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token ?? '');
      set({ 
        user: data.usuario, 
        isAuthenticated: true, 
        isLoading: false 
      });
      return data.usuario;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      });
    } catch (e) {
      console.error('Logout API error:', e);
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      set({ user: null, isAuthenticated: false, isLoading: false });
      window.location.href = '/login';
    }
  },

  restoreSession: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      set({ isLoading: false });
      return;
    }

    try {
      const data = await apiClient.get<AuthUser>('/api/auth/me');
      set({
        user: { id: data.id, email: data.email, nombre: data.nombre, rol: data.rol },
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (refreshToken && (error as Error)?.message !== 'Session expired. Please log in again.') {
        set({ isLoading: false });
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
      } else {
        set({ isLoading: false });
      }
    }
  },
}));
