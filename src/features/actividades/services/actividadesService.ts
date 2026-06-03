import { apiClient } from '@/lib/api-client';
import type { ActividadInstitucional, ActividadFormData, ActividadListResponse, ActividadListParams } from '../types/actividades.types';

export const actividadesService = {
  listar: (params?: ActividadListParams) =>
    apiClient.get<ActividadListResponse>('/api/actividades-institucionales', params as Record<string, string | number | boolean | undefined>),

  obtener: (id: string) =>
    apiClient.get<ActividadInstitucional>(`/api/actividades-institucionales/${id}`),

  crear: (data: ActividadFormData) =>
    apiClient.post<ActividadInstitucional>('/api/actividades-institucionales', data),

  actualizar: (id: string, data: Partial<ActividadFormData>) =>
    apiClient.put<ActividadInstitucional>(`/api/actividades-institucionales/${id}`, data),

  eliminar: (id: string) =>
    apiClient.delete(`/api/actividades-institucionales/${id}`),
};
