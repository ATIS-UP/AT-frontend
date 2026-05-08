import { http, HttpResponse } from 'msw';
import { AlertaAcademica, AlertasStats } from '../../features/alertas/types/alertas.types';

export const alertasHandlers = [
  http.get('/api/alertas', () => {
    const alertas: AlertaAcademica[] = [
      { id: 1, estudiante: 'Maria José Lopez', semestre: 3, materia: 'Cálculo Diferencial', repeticiones: 3, nivel: 'ROJO', estado: 'PENDIENTE', periodoPrevio: '2025-2' },
      { id: 2, estudiante: 'Esteban Ramírez', semestre: 1, materia: 'Álgebra Lineal', repeticiones: 2, nivel: 'AMARILLO', estado: 'EN_PROCESO', periodoPrevio: '2025-2' },
      { id: 3, estudiante: 'Camila Rodriguez', semestre: 5, materia: 'Bases de Datos', repeticiones: 2, nivel: 'AMARILLO', estado: 'RESUELTO', periodoPrevio: '2025-1' },
      { id: 4, estudiante: 'Juan Pablo Duarte', semestre: 2, materia: 'Física I', repeticiones: 3, nivel: 'ROJO', estado: 'PENDIENTE', periodoPrevio: '2025-2' },
    ];
    return HttpResponse.json(alertas);
  }),

  http.get('/api/alertas/stats', () => {
    const stats: AlertasStats = {
      critico: 12,
      medio: 34,
      normal: 89
    };
    return HttpResponse.json(stats);
  }),
];
