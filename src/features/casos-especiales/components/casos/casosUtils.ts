import { TIPOS_REGISTRO } from '../../types/casosEspeciales.types';

export const OBSERVACIONES_MAX_LENGTH = 500;

export function getEstadoVariant(estado: string): 'error' | 'warning' | 'success' | 'default' {
  switch (estado) {
    case 'ACTIVO': return 'error';
    case 'PENDIENTE': return 'warning';
    case 'CERRADO': return 'default';
    default: return 'default';
  }
}

export function getTipoLabel(tipo: string): string {
  const found = TIPOS_REGISTRO.find(t => t.value === tipo);
  return found ? found.label : tipo;
}
