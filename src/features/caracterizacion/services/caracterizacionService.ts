import { apiClient } from '@/src/lib/api-client';

export interface EstratoDatum {
  estrato: number;
  label: string;
  cantidad: number;
}

export interface AgrupadoDatum {
  grupo: string;
  cantidad: number;
}

export interface SocioeconomicaResponse {
  periodo: string | null;
  total_estudiantes: number;
  por_estrato: EstratoDatum[];
  agrupado: AgrupadoDatum[];
}

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

export const caracterizacionService = {
  socioeconomica: (periodo?: string) =>
    apiClient.get<SocioeconomicaResponse>('/api/caracterizacion/socioeconomica', periodo ? { periodo } : undefined),

  procedencia: (periodo?: string) =>
    apiClient.get<ProcedenciaResponse>('/api/caracterizacion/procedencia', periodo ? { periodo } : undefined),

  genero: (periodo?: string) =>
    apiClient.get<GeneroResponse>('/api/caracterizacion/genero', periodo ? { periodo } : undefined),
};
