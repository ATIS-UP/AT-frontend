import { apiClient } from '@/src/lib/api-client';

export interface EstudianteListParams {
  pagina?: number;
  por_pagina?: number;
  buscar?: string;
  programa?: string;
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

  obtenerConteoRelaciones: (id: string) =>
    apiClient.get<{ alertas: number; casos: number; inscripciones: number; respuestas_encuestas: number; artefactos: number }>(
      `/api/estudiantes/${id}/relaciones-conteo`,
    ),

  cambiarEstado: (id: string, data: { estado: string }) =>
    apiClient.put<any>(`/api/estudiantes/${id}/estado`, data),

  descargarPlantilla: () =>
    apiClient.downloadBlob('/api/estudiantes/plantilla-csv'),
};
