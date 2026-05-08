import { AlertaAcademica, AlertasStats } from '../types/alertas.types';
import { useAuthStore } from '../../auth/store/authStore';

const getHeaders = () => {
  const token = useAuthStore.getState().token;
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

export const alertasService = {
  async getAlertas(): Promise<AlertaAcademica[]> {
    const response = await fetch('/api/alertas', { headers: getHeaders() });
    if (!response.ok) throw new Error('Error al obtener alertas');
    const data = await response.json();
    return data.alertas || [];
  },

  async getStats(): Promise<AlertasStats> {
    const response = await fetch('/api/alertas/stats', { headers: getHeaders() });
    if (!response.ok) throw new Error('Error al obtener estadísticas');
    return response.json();
  }
};
