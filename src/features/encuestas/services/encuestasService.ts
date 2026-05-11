import { apiClient } from '@/src/lib/api-client';

export interface EncuestaListParams {
  page?: number;
  limit?: number;
  estado?: string;
}

export const encuestasService = {
  listar: (params?: EncuestaListParams) =>
    apiClient.get<{ encuestas: any[]; total: number }>('/api/encuestas', params as any),

  obtener: (id: string) =>
    apiClient.get<any>(`/api/encuestas/${id}`),

  crear: (data: Record<string, unknown>) =>
    apiClient.post<any>('/api/encuestas', data),

  actualizar: (id: string, data: Record<string, unknown>) =>
    apiClient.put<any>(`/api/encuestas/${id}`, data),

  eliminar: (id: string) =>
    apiClient.delete(`/api/encuestas/${id}`),

  publicar: (id: string) =>
    apiClient.post<any>(`/api/encuestas/${id}/publicar`),

  cerrar: (id: string) =>
    apiClient.post<any>(`/api/encuestas/${id}/cerrar`),

  responder: (id: string, data: Record<string, unknown>) =>
    apiClient.post<any>(`/api/encuestas/${id}/respuestas`, data),

  resultados: (id: string) =>
    apiClient.get<any>(`/api/encuestas/${id}/resultados`),
};
