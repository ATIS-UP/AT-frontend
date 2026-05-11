import { apiClient } from '@/src/lib/api-client';

export interface AlertaListParams {
  page?: number;
  limit?: number;
  tipo?: string;
  nivel?: string;
  estado_seguimiento?: string;
  estudiante_id?: string;
}

export const alertasService = {
  listar: (params?: AlertaListParams) =>
    apiClient.get<{ alertas: any[]; total: number }>('/api/alertas', params as any),

  obtener: (id: string) =>
    apiClient.get<any>(`/api/alertas/${id}`),

  crear: (data: Record<string, unknown>) =>
    apiClient.post<any>('/api/alertas', data),

  actualizar: (id: string, data: Record<string, unknown>) =>
    apiClient.put<any>(`/api/alertas/${id}`, data),

  cambiarEstado: (id: string, estado: string) =>
    apiClient.put<any>(`/api/alertas/${id}/estado`, { estado_seguimiento: estado }),

  eliminar: (id: string) =>
    apiClient.delete(`/api/alertas/${id}`),

  stats: () =>
    apiClient.get<any>('/api/alertas/stats'),

  listarActividades: (alertaId: string) =>
    apiClient.get<any[]>(`/api/alertas/${alertaId}/actividades`),

  crearActividad: (alertaId: string, data: Record<string, unknown>) =>
    apiClient.post<any>(`/api/alertas/${alertaId}/actividades`, data),
};
