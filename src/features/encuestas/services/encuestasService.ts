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

  listarPublicas: () =>
    apiClient.get<{ encuestas: any[] }>('/api/encuestas/publicas'),

  obtenerInfoPublica: (id: string) =>
    apiClient.get<any>(`/api/encuestas/${id}/info-publica`),

  verificarEstudiante: (encuestaId: string, documento: string) =>
    apiClient.post<{
      existe: boolean;
      ya_respondio: boolean;
      puede_responder: boolean;
      estudiante_nombre: string | null;
      estudiante_id: string | null;
    }>(`/api/encuestas/${encuestaId}/verificar-estudiante`, { documento }),

  responderPublico: (encuestaId: string, data: { documento: string; respuestas: any[] }) =>
    apiClient.post<any>(`/api/encuestas/${encuestaId}/responder-publico`, data),
};
