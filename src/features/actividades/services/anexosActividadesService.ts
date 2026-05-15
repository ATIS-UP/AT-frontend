import { apiClient } from '@/src/lib/api-client';
import type { AnexoActividad, AnexoActividadListResponse } from '../types/anexosActividades.types';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export const anexosActividadesService = {
  listar: (actividadId: string) =>
    apiClient.get<AnexoActividadListResponse>(`/api/actividades/${actividadId}/anexos`),

  subir: (actividadId: string, file: File) =>
    apiClient.upload<AnexoActividad>(`/api/actividades/${actividadId}/anexos`, file),

  descargarUrl: (anexoId: string) =>
    `${BASE_URL}/api/actividades/anexos/${anexoId}/download`,

  eliminar: (anexoId: string) =>
    apiClient.delete(`/api/actividades/anexos/${anexoId}`),
};
