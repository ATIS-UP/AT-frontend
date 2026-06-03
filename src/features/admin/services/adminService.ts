import { apiClient } from '@/lib/api-client';

export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  rol: string;
  is_active: boolean;
  is_verified: boolean;
  last_login: string | null;
  created_at: string;
}

export interface PermisoInfo {
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoria: string;
}

export interface UserPermisosResponse {
  usuario_id: string;
  rol: string;
  permisos: PermisoInfo[];
  overrides: { codigo: string; tiene_permiso: boolean }[];
}

export const adminService = {
  listarUsuarios: (params?: { pagina?: number; por_pagina?: number; buscar?: string; rol?: string }) =>
    apiClient.get<Usuario[]>('/api/admin/usuarios', params as any),

  obtenerUsuario: (id: string) =>
    apiClient.get<Usuario>(`/api/admin/usuarios/${id}`),

  crearUsuario: (data: { email: string; password: string; nombre: string; rol: string; is_active?: boolean }) =>
    apiClient.post<Usuario>('/api/admin/usuarios', data),

  actualizarUsuario: (id: string, data: { email?: string; nombre?: string; rol?: string; is_active?: boolean }) =>
    apiClient.put<Usuario>(`/api/admin/usuarios/${id}`, data),

  eliminarUsuario: (id: string) =>
    apiClient.delete(`/api/admin/usuarios/${id}`),

  obtenerPermisosCatalogo: () =>
    apiClient.get<Record<string, PermisoInfo[]>>('/api/admin/permisos'),

  obtenerPermisosUsuario: (id: string) =>
    apiClient.get<UserPermisosResponse>(`/api/admin/usuarios/${id}/permisos`),

  actualizarPermisosUsuario: (id: string, permisos: { codigo: string; tiene_permiso: boolean }[]) =>
    apiClient.put<UserPermisosResponse>(`/api/admin/usuarios/${id}/permisos`, { permisos }),
};
