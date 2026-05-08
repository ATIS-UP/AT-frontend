export type NivelRiesgo = 'ROJO' | 'AMARILLO' | 'VERDE';
export type EstadoSeguimiento = 'PENDIENTE' | 'EN_PROCESO' | 'RESUELTO';

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
  critico: number;
  medio: number;
  normal: number;
}
