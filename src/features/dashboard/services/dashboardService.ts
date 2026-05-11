import { apiClient } from '@/src/lib/api-client';

export interface DashboardResumen {
  total_estudiantes: number;
  total_alertas: number;
  alertas_activas: number;
  encuestas_activas: number;
}

export interface DashboardEstados {
  por_estado: Record<string, number>;
  por_nivel: Record<string, number>;
}

export const dashboardService = {
  resumen: () =>
    apiClient.get<DashboardResumen>('/api/dashboard/resumen'),

  estados: () =>
    apiClient.get<DashboardEstados>('/api/dashboard/estados'),

  recientes: (limite = 10) =>
    apiClient.get<any[]>('/api/dashboard/recientes', { limite }),
};
