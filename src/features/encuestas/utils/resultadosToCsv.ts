import { buildCsv } from './csv';
import type { EncuestaResultados } from '../services/encuestasService';

export function resultadosToCsv(data: EncuestaResultados): string {
  const headers = [
    'Pregunta',
    'Tipo',
    'Categoria',
    'Opcion/Valor',
    'Cantidad',
    'Porcentaje',
  ];
  const rows: unknown[][] = [];

  for (const r of data.resultados_por_pregunta) {
    if (r.distribucion && Object.keys(r.distribucion).length > 0) {
      for (const [opcion, count] of Object.entries(r.distribucion)) {
        const pct =
          r.total_respuestas > 0
            ? Math.round((count / r.total_respuestas) * 100)
            : 0;
        rows.push([r.texto, r.tipo, 'opcion', opcion, count, `${pct}%`]);
      }
      rows.push([r.texto, r.tipo, 'total', '', r.total_respuestas, '100%']);
    } else if (r.tipo === 'escala_likert' && r.promedio != null) {
      rows.push([
        r.texto,
        r.tipo,
        'promedio',
        '',
        '',
        Number(r.promedio).toFixed(2),
      ]);
    } else if (r.tipo === 'texto_libre' && r.respuestas_texto) {
      for (const txt of r.respuestas_texto) {
        rows.push([r.texto, r.tipo, 'respuesta', txt, '', '']);
      }
    }
  }

  return buildCsv(headers, rows);
}
