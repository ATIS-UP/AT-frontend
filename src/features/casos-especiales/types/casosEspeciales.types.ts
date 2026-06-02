export type TipoRegistro = 'SOCIO_ECONOMICO' | 'RENDIMIENTO_ACADEMICO' | 'PSICOSOCIAL' | 'INSTITUCIONAL_VOCACIONAL' | 'OTRO';

export type EstadoRegistro = 'ACTIVO' | 'CERRADO' | 'PENDIENTE';

export interface EstudianteInfo {
  id: string;
  codigo: string;
  documento?: string;
  nombres: string;
  apellidos: string;
  programa: string;
  semestre: number;
  estado: string;
}

export interface NovedadCaso {
  id: string;
  tipo_caso: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  orden: number;
  created_at?: string;
}

export interface RegistroCaso {
  id: string;
  estudiante_id: string;
  estudiante: EstudianteInfo;
  tipo: TipoRegistro;
  estado: EstadoRegistro;
  novedad_id?: string;
  novedad?: { id: string; nombre: string; descripcion?: string | null };
  observaciones?: string;
  responsable_id: string;
  responsable_nombre: string;
  created_at: string;
  updated_at?: string;
}

export interface HistorialRegistro {
  id: string;
  registro_id: string;
  accion: string;
  observaciones?: string;
  responsable_id: string;
  responsable_nombre: string;
  created_at: string;
}

export interface BusquedaEstudiante {
  estudiante: EstudianteInfo;
  registros: RegistroCaso[];
  total_registros: number;
}

export interface BusquedaEstudianteResponse {
  resultados: BusquedaEstudiante[];
  total: number;
  pagina: number;
  por_pagina: number;
}

export interface RegistroCreate {
  estudiante_id: string;
  tipo: TipoRegistro;
  novedad_id: string;
  observaciones?: string;
}

export interface RegistroUpdate {
  tipo?: TipoRegistro;
  estado?: EstadoRegistro;
  novedad_id?: string;
  observaciones?: string;
}

export interface HistorialCreate {
  accion: string;
  observaciones?: string;
}

export const TIPOS_REGISTRO: { value: TipoRegistro; label: string }[] = [
  { value: 'RENDIMIENTO_ACADEMICO', label: 'Académica' },
  { value: 'PSICOSOCIAL', label: 'Psicosocial y de Salud' },
  { value: 'SOCIO_ECONOMICO', label: 'Socioeconómica' },
  { value: 'INSTITUCIONAL_VOCACIONAL', label: 'Institucional y Vocacional' },
  { value: 'OTRO', label: 'Otra' },
];

export const ESTADOS_REGISTRO: { value: EstadoRegistro; label: string }[] = [
  { value: 'ACTIVO', label: 'Activo' },
  { value: 'PENDIENTE', label: 'Pendiente' },
  { value: 'CERRADO', label: 'Cerrado' },
];

export const ACCIONES_HISTORIAL: { value: string; label: string }[] = [
  { value: 'APERTURA', label: 'Apertura' },
  { value: 'SEGUIMIENTO', label: 'Seguimiento' },
  { value: 'CIERRE', label: 'Cierre' },
  { value: 'REAPERTURA', label: 'Reapertura' },
];