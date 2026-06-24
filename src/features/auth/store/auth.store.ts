import { create } from 'zustand';
import { Rol } from '../../../shared/types/roles.types';
import { apiClient } from '@/lib/api-client';

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
  access_token?: string;
  refresh_token?: string;
  usuario?: {
    id: string;
    email: string;
    nombre: string;
    rol: Rol;
    mfa_enabled?: boolean;
  };
  mfa_required?: boolean;
  temp_token?: string;
}

interface MfaSetupResponse {
  secret: string;
  uri: string;
  qr_code_url: string;
}

interface AuthStore {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  mfaTempToken: string | null;
  login: (tokens: Tokens, user: AuthUser) => void;
  loginWithCredentials: (email: string, password: string) => Promise<AuthUser | { mfa_required: true; temp_token: string }>;
  verifyMfaTotp: (tempToken: string, totpCode: string) => Promise<void>;
  verifyMfaEmailOtp: (tempToken: string, emailCode: string) => Promise<void>;
  requestMfaEmailOtp: (tempToken: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  mfaTempToken: null,

  login: (tokens, user) => {
    localStorage.setItem(TOKEN_KEY, tokens.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
    set({ user, isAuthenticated: true, isLoading: false, mfaTempToken: null });
  },

  loginWithCredentials: async (email, password): Promise<AuthUser | { mfa_required: true; temp_token: string }> => {
    const fullEmail = email.includes('@') ? email : `${email}@unipamplona.edu.co`;

    try {
      const data = await apiClient.post<LoginResponse>('/api/auth/login', {
        email: fullEmail,
        password
      });

      if (data.mfa_required && data.temp_token) {
        set({ mfaTempToken: data.temp_token, isLoading: false });
        return { mfa_required: true as const, temp_token: data.temp_token };
      }

      localStorage.setItem(TOKEN_KEY, data.access_token!);
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token ?? '');
      set({
        user: data.usuario!,
        isAuthenticated: true,
        isLoading: false,
        mfaTempToken: null,
      });
      return data.usuario!;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  verifyMfaTotp: async (tempToken: string, totpCode: string) => {
    const data = await apiClient.post<LoginResponse>('/api/auth/mfa/verify', {
      temp_token: tempToken,
      totp_code: totpCode,
    });

    localStorage.setItem(TOKEN_KEY, data.access_token!);
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token ?? '');
    set({
      user: data.usuario!,
      isAuthenticated: true,
      isLoading: false,
      mfaTempToken: null,
    });
  },

  verifyMfaEmailOtp: async (tempToken: string, emailCode: string) => {
    const data = await apiClient.post<LoginResponse>('/api/auth/mfa/verify-email-otp', {
      temp_token: tempToken,
      email_code: emailCode,
    });

    localStorage.setItem(TOKEN_KEY, data.access_token!);
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token ?? '');
    set({
      user: data.usuario!,
      isAuthenticated: true,
      isLoading: false,
      mfaTempToken: null,
    });
  },

  requestMfaEmailOtp: async (tempToken: string) => {
    await apiClient.post('/api/auth/mfa/email-otp', {
      temp_token: tempToken,
    });
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
      set({ user: null, isAuthenticated: false, isLoading: false, mfaTempToken: null });
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
    } catch {
      set({ isLoading: false });
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  },
}));
