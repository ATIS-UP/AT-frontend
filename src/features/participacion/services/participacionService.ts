import { apiClient } from '@/src/lib/api-client';

export interface ProcedenciaDatum {
  procedencia: string;
  codigo: string;
  cantidad: number;
}

export interface ProcedenciaResponse {
  periodo: string | null;
  total_estudiantes: number;
  datos: ProcedenciaDatum[];
}

export interface GeneroDatum {
  genero: string;
  codigo: string;
  cantidad: number;
}

export interface GeneroResponse {
  periodo: string | null;
  total_estudiantes: number;
  datos: GeneroDatum[];
}

export interface EstratoDatum {
  estrato: number;
  label: string;
  cantidad: number;
}

export interface AgrupadoDatum {
  grupo: string;
  cantidad: number;
}

export interface EstratoResponse {
  periodo: string | null;
  total_estudiantes: number;
  por_estrato: EstratoDatum[];
  agrupado: AgrupadoDatum[];
}

export const participacionService = {
  procedencia: (periodo?: string) =>
    apiClient.get<ProcedenciaResponse>('/api/participacion/procedencia', periodo ? { periodo } : undefined),

  genero: (periodo?: string) =>
    apiClient.get<GeneroResponse>('/api/participacion/genero', periodo ? { periodo } : undefined),

  estrato: (periodo?: string) =>
    apiClient.get<EstratoResponse>('/api/participacion/estrato', periodo ? { periodo } : undefined),
};
