import { http, HttpResponse } from 'msw';

export const encuestasHandlers = [
  http.get('/api/encuestas', () => {
    return HttpResponse.json({
      total: 2,
      pagina: 1,
      por_pagina: 20,
      encuestas: [
        { id: 'e1', titulo: 'Encuesta de prueba', descripcion: 'Desc', preguntas: [], estado: 'BORRADOR', periodo: null, fecha_inicio: null, fecha_fin: null, es_publica: false, created_at: '2025-01-01T00:00:00Z', updated_at: null },
      ],
    });
  }),

  http.post('/api/encuestas/:encuestaId/verificar-estudiante', async ({ request }) => {
    const body = await request.json() as { documento: string };
    if (body.documento === '12345678') {
      return HttpResponse.json({
        existe: true,
        ya_respondio: false,
        puede_responder: true,
        estudiante_nombre: 'Juan Pérez',
        estudiante_id: 'est-1',
        preguntas: [
          { id: 1, texto: 'Estrato', tipo: 'opcion_multiple', opciones: ['1', '2', '3'], requerida: true, campo: 'estrato', editable: true, valor_actual: '3' },
          { id: 2, texto: 'Email', tipo: 'texto_libre', requerida: false, campo: 'email', editable: true, valor_actual: 'ju****@****.com' },
        ],
      });
    }
    return HttpResponse.json({ existe: false, ya_respondio: false, puede_responder: false, estudiante_nombre: null, estudiante_id: null });
  }),

  http.post('/api/encuestas/:encuestaId/responder-publico', async () => {
    return HttpResponse.json({ id: 'resp-1', encuesta_id: 'e1', estudiante_id: 'est-1', respuestas: [], created_at: '2025-01-01T00:00:00Z' }, { status: 201 });
  }),
];
