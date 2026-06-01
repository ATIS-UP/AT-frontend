import { apiClient } from '@/src/lib/api-client';

export interface TcbuSerie {
  periodo: string;
  Cultural: number;
  'Inclusión': number;
  'Act. Física': number;
  Salud: number;
  'Socioeconómica': number;
  Espiritual: number;
  'Psicológica': number;
  'Odontología': number;
  'Alimentación': number;
  SIMUP: number;
  [key: string]: number | string;
}

export interface TcbuResponse {
  periodos: string[];
  servicios: string[];
  series: TcbuSerie[];
}

export interface CargaResult {
  insertados: number;
  actualizados: number;
  errores: Array<{ fila: number; error: string }>;
  total_filas: number;
}

export const bienestarService = {
  getTcbu: (params?: { periodo_inicio?: string; periodo_fin?: string }) =>
    apiClient.get<TcbuResponse>('/api/bienestar/tcbu', params as Record<string, string> | undefined),

  cargaCsv: (file: File) =>
    apiClient.upload<CargaResult>('/api/bienestar/tcbu/carga', file),

  plantillaUrl: () => '/api/bienestar/tcbu/plantilla',
};
