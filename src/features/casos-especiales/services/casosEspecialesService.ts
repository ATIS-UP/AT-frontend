import { apiClient } from '@/src/lib/api-client';
import type {
  BusquedaEstudiante,
  RegistroCaso,
  HistorialRegistro,
  RegistroCreate,
  RegistroUpdate,
  HistorialCreate
} from './casosEspeciales.types';

export const casosEspecialesService = {
  buscarEstudiante: (q: string, pagina: number = 1) =>
    apiClient.get<BusquedaEstudianteResponse>('/api/registros-casos/buscar-estudiante', { q, pagina }),

  crear: (data: RegistroCreate) =>
    apiClient.post<RegistroCaso>('/api/registros-casos', data),

  listar: (pagina: number = 1, por_pagina: number = 20, estado?: string, tipo?: string) =>
    apiClient.get<{ registros: RegistroCaso[]; total: number }>('/api/registros-casos', {
      pagina,
      por_pagina,
      ...(estado && { estado }),
      ...(tipo && { tipo }),
    }),

  obtener: (id: string) =>
    apiClient.get<RegistroCaso>(`/api/registros-casos/${id}`),

  actualizar: (id: string, data: RegistroUpdate) =>
    apiClient.put<RegistroCaso>(`/api/registros-casos/${id}`, data),

  obtenerHistorial: (id: string) =>
    apiClient.get<{ historiales: HistorialRegistro[]; total: number }>(`/api/registros-casos/${id}/historial`),

  agregarHistorial: (id: string, data: HistorialCreate) =>
    apiClient.post<RegistroCaso>(`/api/registros-casos/${id}/historial`, data),
};