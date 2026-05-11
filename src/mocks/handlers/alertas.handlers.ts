import { http, HttpResponse } from 'msw';

// mock data matching backend AlertaResponse schema with ISO 8601 dates
const mockAlertas = [
  {
    id: '1',
    estudiante_id: 'est-001',
    materia_id: 'mat-001',
    nivel_riesgo: 'ROJO',
    estado_seguimiento: 'PENDIENTE',
    descripcion: 'Repitencia multiple en Calculo Diferencial',
    periodo: '2025-1',
    promedio_anterior: 2.1,
    promedio_actual: 1.8,
    promedio_proyeccion: null,
    docentes_notificados: ['doc-001'],
    created_at: '2025-01-15T10:30:00Z',
    updated_at: '2025-01-15T10:30:00Z',
  },
  {
    id: '2',
    estudiante_id: 'est-002',
    materia_id: 'mat-002',
    nivel_riesgo: 'AMARILLO',
    estado_seguimiento: 'EN_PROCESO',
    descripcion: 'Bajo rendimiento en Algebra Lineal',
    periodo: '2025-1',
    promedio_anterior: 3.0,
    promedio_actual: 2.5,
    promedio_proyeccion: 2.8,
    docentes_notificados: ['doc-002'],
    created_at: '2025-01-20T14:00:00Z',
    updated_at: '2025-02-01T09:15:00Z',
  },
  {
    id: '3',
    estudiante_id: 'est-003',
    materia_id: 'mat-003',
    nivel_riesgo: 'AMARILLO',
    estado_seguimiento: 'RESUELTO',
    descripcion: 'Mejora progresiva en Bases de Datos',
    periodo: '2025-1',
    promedio_anterior: 2.8,
    promedio_actual: 3.5,
    promedio_proyeccion: 3.7,
    docentes_notificados: ['doc-003', 'doc-004'],
    created_at: '2025-01-10T08:00:00Z',
    updated_at: '2025-03-05T16:45:00Z',
  },
  {
    id: '4',
    estudiante_id: 'est-004',
    materia_id: 'mat-004',
    nivel_riesgo: 'ROJO',
    estado_seguimiento: 'PENDIENTE',
    descripcion: 'Repitencia en Fisica I',
    periodo: '2025-1',
    promedio_anterior: 1.9,
    promedio_actual: 1.5,
    promedio_proyeccion: null,
    docentes_notificados: [],
    created_at: '2025-02-01T11:00:00Z',
    updated_at: '2025-02-01T11:00:00Z',
  },
];

export const alertasHandlers = [
  // returns paginated AlertaListResponse structure
  http.get('/api/alertas', ({ request }) => {
    const url = new URL(request.url);
    const pagina = Number(url.searchParams.get('pagina') || '1');
    const porPagina = Number(url.searchParams.get('por_pagina') || '10');

    const start = (pagina - 1) * porPagina;
    const paginatedAlertas = mockAlertas.slice(start, start + porPagina);

    return HttpResponse.json({
      total: mockAlertas.length,
      pagina,
      por_pagina: porPagina,
      alertas: paginatedAlertas,
    });
  }),

  http.get('/api/alertas/stats', () => {
    return HttpResponse.json({
      total: mockAlertas.length,
      critico: 2,
      medio: 2,
      bajo: 0,
      pendientes: 2,
      en_proceso: 1,
      resueltos: 1,
    });
  }),
];
