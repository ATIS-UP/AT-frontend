import { apiClient } from '@/lib/api-client';

export interface DashboardResumen {
  estudiantes: { total: number; activos: number };
  alertas: { total: number; criticas: number; pendientes: number; en_proceso: number; resueltas: number };
  programas: { programa: string; total: number }[];
  tendencias: { periodo: string; total: number }[];
}

export interface DashboardEstados {
  estudiantes: { estado: string; total: number }[];
  alertas: { estado: string; total: number }[];
  niveles_riesgo: { nivel: string; total: number }[];
}

export interface AlertaReciente {
  id: string;
  estudiante_id: string;
  estudiante_nombre: string | null;
  nivel_riesgo: string;
  estado_seguimiento: string;
  periodo: string;
  created_at: string;
}

export interface DashboardRecientes {
  alertas_recientes: AlertaReciente[];
}

export interface ActividadResumen {
  id: string;
  tipo: string;
  estado: string;
  descripcion: string;
  encargado: string;
  modalidad: string;
  created_at: string;
}

export const dashboardService = {
  resumen: () =>
    apiClient.get<DashboardResumen>('/api/dashboard/resumen'),

  estados: () =>
    apiClient.get<DashboardEstados>('/api/dashboard/estados'),

  recientes: (limite = 10) =>
    apiClient.get<DashboardRecientes>('/api/dashboard/recientes', { limite }),

  actividadesRecientes: (limite = 5) =>
    apiClient.get<{ actividades: ActividadResumen[]; total: number }>('/api/actividades-institucionales', { pagina: 1, por_pagina: limite }),
};
