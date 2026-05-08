import { AlertaAcademica, AlertasStats } from '../types/alertas.types';

export const alertasService = {
  async getAlertas(): Promise<AlertaAcademica[]> {
    const response = await fetch('/api/alertas');
    if (!response.ok) throw new Error('Error al obtener alertas');
    return response.json();
  },

  async getStats(): Promise<AlertasStats> {
    const response = await fetch('/api/alertas/stats');
    if (!response.ok) throw new Error('Error al obtener estadísticas');
    return response.json();
  }
};
