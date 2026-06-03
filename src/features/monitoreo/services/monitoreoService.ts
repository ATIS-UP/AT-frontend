import { apiClient } from '@/src/lib/api-client';

export interface MateriaDificultad {
  materia: string;
  cantidad: number;
}

export interface MonitoreoResponse {
  periodo: string;
  total_estudiantes: number;
  ingreso_familiar_promedio: number;
  porcentaje_ciencias_exactas: number;
  materias: MateriaDificultad[];
  total_menciones: number;
}

export const monitoreoService = {
  materiasDificultad: (periodo?: string) =>
    apiClient.get<MonitoreoResponse>('/api/monitoreo/materias-dificultad', periodo ? { periodo } : undefined),
};
