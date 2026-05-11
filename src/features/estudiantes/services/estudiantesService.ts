import { apiClient } from '@/src/lib/api-client';

export interface EstudianteListParams {
  page?: number;
  limit?: number;
  search?: string;
  programa?: string;
  semestre?: number;
  estado?: string;
}

export const estudiantesService = {
  listar: (params?: EstudianteListParams) =>
    apiClient.get<{ estudiantes: any[]; total: number }>('/api/estudiantes', params as any),

  obtener: (id: string) =>
    apiClient.get<any>(`/api/estudiantes/${id}`),

  crear: (data: Record<string, unknown>) =>
    apiClient.post<any>('/api/estudiantes', data),

  actualizar: (id: string, data: Record<string, unknown>) =>
    apiClient.put<any>(`/api/estudiantes/${id}`, data),

  eliminar: (id: string) =>
    apiClient.delete(`/api/estudiantes/${id}`),

  historial: (id: string) =>
    apiClient.get<any[]>(`/api/estudiantes/${id}/historial`),

  cargaMasiva: (file: File) =>
    apiClient.upload<{ insertadas: number; actualizadas: number; errores: any[] }>(
      '/api/estudiantes/carga-masiva',
      file,
    ),
};
