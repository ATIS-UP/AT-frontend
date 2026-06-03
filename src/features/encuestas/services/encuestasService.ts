import { apiClient } from '@/src/lib/api-client';
import type {
  Encuesta,
  EncuestaCreate,
  EncuestaUpdate,
  Pregunta,
} from '@/src/shared/schemas/encuesta.schema';

export interface EncuestaListParams {
  page?: number;
  limit?: number;
  estado?: string;
}

export interface EncuestaPublicaInfo {
  id: string;
  titulo: string;
  descripcion: string | null;
  preguntas: Array<{
    id: number;
    texto: string;
    tipo: string;
    opciones?: string[];
    requerida?: boolean;
  }>;
}

export interface EncuestaResultados {
  encuesta_id: string;
  titulo: string;
  total_respuestas: number;
  resultados_por_pregunta: Array<{
    pregunta_id: number;
    texto: string;
    tipo: string;
    total_respuestas: number;
    distribucion?: Record<string, number> | null;
    promedio?: number | null;
    respuestas_texto?: string[];
  }>;
}

export interface VerificarEstudianteResponse {
  existe: boolean;
  ya_respondio: boolean;
  puede_responder: boolean;
  estudiante_nombre: string | null;
  estudiante_id: string | null;
}

export interface ResponderPublicoPayload {
  documento: string;
  respuestas: Array<{ pregunta_id: number; valor: unknown }>;
}

export interface ProcesarVencimientosResponse {
  cerradas: number;
  procesadas: number;
  fecha_referencia: string;
}

function normalizarPreguntas(payload: EncuestaCreate | EncuestaUpdate) {
  if (!payload.preguntas) return payload;
  return {
    ...payload,
    preguntas: payload.preguntas.map((p: Pregunta) => {
      const { id, ...rest } = p;
      const out: Record<string, unknown> = { ...rest };
      if (typeof id === 'number') out.id = id;
      return out;
    }),
  };
}

export const encuestasService = {
  listar: (params?: EncuestaListParams) =>
    apiClient.get<{ encuestas: Encuesta[]; total: number }>('/api/encuestas', params as any),

  obtener: (id: string) => apiClient.get<Encuesta>(`/api/encuestas/${id}`),

  crear: (data: EncuestaCreate) =>
    apiClient.post<Encuesta>('/api/encuestas', normalizarPreguntas(data)),

  actualizar: (id: string, data: EncuestaUpdate) =>
    apiClient.put<Encuesta>(`/api/encuestas/${id}`, normalizarPreguntas(data)),

  eliminar: (id: string) => apiClient.delete(`/api/encuestas/${id}`),

  publicar: (id: string) => apiClient.post<Encuesta>(`/api/encuestas/${id}/publicar`),

  cerrar: (id: string) => apiClient.post<Encuesta>(`/api/encuestas/${id}/cerrar`),

  duplicar: (id: string) => apiClient.post<Encuesta>(`/api/encuestas/${id}/duplicar`, {}),

  responder: (id: string, respuestas: Array<{ pregunta_id: number; valor: unknown }>) =>
    apiClient.post<unknown>(`/api/encuestas/${id}/respuestas`, { respuestas }),

  resultados: (id: string) => apiClient.get<EncuestaResultados>(`/api/encuestas/${id}/resultados`),

  listarPublicas: () => apiClient.get<{ encuestas: Encuesta[] }>('/api/encuestas/publicas'),

  obtenerInfoPublica: (id: string) => apiClient.get<EncuestaPublicaInfo>(`/api/encuestas/${id}/info-publica`),

  verificarEstudiante: (encuestaId: string, documento: string) =>
    apiClient.post<VerificarEstudianteResponse>(
      `/api/encuestas/${encuestaId}/verificar-estudiante`,
      { documento }
    ),

  responderPublico: (encuestaId: string, data: ResponderPublicoPayload) =>
    apiClient.post<unknown>(`/api/encuestas/${encuestaId}/responder-publico`, data),

  procesarVencimientos: () =>
    apiClient.post<ProcesarVencimientosResponse>('/api/encuestas/procesar-vencimientos', {}),
};
