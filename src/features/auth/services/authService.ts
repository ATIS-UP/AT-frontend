import { apiClient } from '@/src/lib/api-client';

export interface AuthUser {
  id: string;
  email: string;
  nombre: string;
  rol: string;
  created_at?: string;
}

export interface CambiarPasswordPayload {
  password_actual: string;
  password_nueva: string;
}

export const authService = {
  me: () =>
    apiClient.get<AuthUser>('/api/auth/me'),

  cambiarPassword: (data: CambiarPasswordPayload) =>
    apiClient.put<{ message: string }>('/api/auth/cambiar-password', data),

  permisos: () =>
    apiClient.get<string[]>('/api/auth/permisos'),
};
