import { apiClient } from '@/src/lib/api-client';

export interface ArtefactoListParams {
  page?: number;
  limit?: number;
  tipo?: string;
  estudiante_id?: string;
  alerta_id?: string;
}

export const artefactosService = {
  listar: (params?: ArtefactoListParams) =>
    apiClient.get<{ artefactos: any[]; total: number }>('/api/artefactos', params as any),

  obtener: (id: string) =>
    apiClient.get<any>(`/api/artefactos/${id}`),

  subir: (file: File, params?: Record<string, string>) =>
    apiClient.upload<any>('/api/artefactos', file, params),

  descargar: (id: string) =>
    `${import.meta.env.VITE_API_URL ?? ''}/api/artefactos/${id}/download`,

  eliminar: (id: string) =>
    apiClient.delete(`/api/artefactos/${id}`),
};
