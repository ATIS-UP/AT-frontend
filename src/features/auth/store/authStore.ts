import { create } from 'zustand';
import { Rol } from '../../../shared/types/roles.types';

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
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) throw new Error('Login fallido');
      
      const data = await response.json();
      
      set({
        user: { id: data.usuario.id, email: data.usuario.email, nombre: data.usuario.nombre },
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
      const token = useAuthStore.getState().token;
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (e) {
      console.error(e);
    } finally {
      set({ user: null, rol: null, token: null, isAuthenticated: false });
    }
  },
}));