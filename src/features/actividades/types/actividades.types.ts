export type TipoActividad =
  | 'CLASE'
  | 'REFUERZO'
  | 'TORNEO'
  | 'TALLER'
  | 'SEMINARIO'
  | 'TUTORIA'
  | 'OTRO';

export type EstadoActividad =
  | 'CREADA'
  | 'EN_CURSO'
  | 'FINALIZADA'
  | 'CANCELADA';

export type Modalidad =
  | 'PRESENCIAL'
  | 'VIRTUAL'
  | 'HIBRIDA';

export interface ActividadInstitucional {
  id: string;
  tipo: TipoActividad;
  fecha_inicio: string;
  fecha_fin: string;
  estado: EstadoActividad;
  descripcion: string;
  encargado: string;
  observaciones: string | null;
  anexos: string | null;
  total_anexos: number;
  creador_id: string;
  creador_nombre: string;
  modalidad: Modalidad;
  lugar_enlace: string;
  created_at: string;
  updated_at: string;
}

export interface ActividadFormData {
  tipo: TipoActividad;
  fecha_inicio: string;
  fecha_fin: string;
  estado?: EstadoActividad;
  descripcion: string;
  encargado: string;
  observaciones: string;
  anexos?: string;
  modalidad: Modalidad;
  lugar_enlace: string;
}

export interface ActividadListResponse {
  total: number;
  pagina: number;
  por_pagina: number;
  actividades: ActividadInstitucional[];
}

export interface ActividadListParams {
  pagina?: number;
  por_pagina?: number;
  tipo?: string;
  estado?: string;
}

export const TIPO_OPTIONS = [
  { value: 'CLASE', label: 'Clase' },
  { value: 'REFUERZO', label: 'Refuerzo' },
  { value: 'TORNEO', label: 'Torneo' },
  { value: 'TALLER', label: 'Taller' },
  { value: 'SEMINARIO', label: 'Seminario' },
  { value: 'TUTORIA', label: 'Tutoría' },
  { value: 'OTRO', label: 'Otro' },
];

export const ESTADO_OPTIONS = [
  { value: 'CREADA', label: 'Creada' },
  { value: 'EN_CURSO', label: 'En Curso' },
  { value: 'FINALIZADA', label: 'Finalizada' },
  { value: 'CANCELADA', label: 'Cancelada' },
];

export const MODALIDAD_OPTIONS = [
  { value: 'PRESENCIAL', label: 'Presencial' },
  { value: 'VIRTUAL', label: 'Virtual' },
  { value: 'HIBRIDA', label: 'Híbrida' },
];

/** Color mapping for activity states (badge styling) */
export const ESTADO_COLORS: Record<EstadoActividad, string> = {
  CREADA: 'border-sky-200 text-sky-700 bg-sky-50',
  EN_CURSO: 'border-amber-200 text-amber-700 bg-amber-50',
  FINALIZADA: 'border-emerald-200 text-emerald-700 bg-emerald-50',
  CANCELADA: 'border-slate-200 text-slate-500 bg-slate-50',
};

/** Color mapping for activity types */
export const TIPO_COLORS: Record<TipoActividad, string> = {
  CLASE: 'border-indigo-200 text-indigo-700 bg-indigo-50',
  REFUERZO: 'border-violet-200 text-violet-700 bg-violet-50',
  TORNEO: 'border-orange-200 text-orange-700 bg-orange-50',
  TALLER: 'border-teal-200 text-teal-700 bg-teal-50',
  SEMINARIO: 'border-cyan-200 text-cyan-700 bg-cyan-50',
  TUTORIA: 'border-pink-200 text-pink-700 bg-pink-50',
  OTRO: 'border-slate-200 text-slate-600 bg-slate-50',
};
