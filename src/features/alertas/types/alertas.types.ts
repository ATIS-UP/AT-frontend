export type NivelRiesgo = 'ROJO' | 'AMARILLO' | 'VERDE';
export type EstadoSeguimiento = 'PENDIENTE' | 'EN_PROCESO' | 'RESUELTO' | 'DESCARTADO';

export interface AlertaAcademica {
  id: string | number;
  estudiante: string;
  semestre: number;
  materia: string;
  repeticiones: number;
  nivel: NivelRiesgo;
  estado: EstadoSeguimiento;
  periodoPrevio: string;
}

export interface AlertasStats {
  total: number;
  critico: number;
  medio: number;
  bajo: number;
  pendientes: number;
  en_proceso: number;
  resueltos: number;
}
