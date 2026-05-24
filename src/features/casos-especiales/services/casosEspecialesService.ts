import { apiClient } from '@/src/lib/api-client';
import type {
  BusquedaEstudianteResponse,
  RegistroCaso,
  HistorialRegistro,
  RegistroCreate,
  RegistroUpdate,
  HistorialCreate,
  NovedadCaso,
} from '../types/casosEspeciales.types';

export const casosEspecialesService = {
  buscarEstudiante: (q: string, pagina: number = 1, tipo?: string) =>
    apiClient.get<BusquedaEstudianteResponse>('/api/registros-casos/buscar-estudiante', {
      q,
      pagina,
      ...(tipo && { tipo }),
    }),

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

  eliminar: (id: string) =>
    apiClient.delete(`/api/registros-casos/${id}`),

  listarNovedades: (tipo_caso?: string) =>
    apiClient.get<NovedadCaso[]>('/api/novedades-casos', {
      ...(tipo_caso && { tipo_caso }),
      solo_activos: 'true',
    }),

  crearNovedad: (data: { tipo_caso: string; nombre: string }) =>
    apiClient.post<NovedadCaso>('/api/novedades-casos', data),

  actualizarNovedad: (id: string, data: { nombre?: string; activo?: boolean }) =>
    apiClient.put<NovedadCaso>(`/api/novedades-casos/${id}`, data),

  eliminarNovedad: (id: string) =>
    apiClient.delete(`/api/novedades-casos/${id}`),
};
