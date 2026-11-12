import { describe, it, expect } from 'vitest';
import { esFechaValida, esRespuestaVacia, formatearFechaInput, backendPreguntasToForm } from '../encuestaUtils';
import { createCharFilter, CharType } from '@/lib/validation';

describe('encuestaUtils', () => {
  it('formatearFechaInput aplica la máscara DD/MM/AAAA', () => {
    expect(formatearFechaInput('1')).toBe('1');
    expect(formatearFechaInput('150')).toBe('15/0');
    expect(formatearFechaInput('15032004')).toBe('15/03/2004');
    expect(formatearFechaInput('15/03/20049999')).toBe('15/03/2004');
    expect(formatearFechaInput('ab15-03')).toBe('15/03');
  });

  it('esFechaValida acepta solo fechas reales en DD/MM/AAAA', () => {
    expect(esFechaValida('29/02/2024')).toBe(true);
    expect(esFechaValida('29/02/2023')).toBe(false);
    expect(esFechaValida('31/04/2024')).toBe(false);
    expect(esFechaValida('2024-02-01')).toBe(false);
    expect(esFechaValida('1/2/2024')).toBe(false);
  });

  it('esRespuestaVacia', () => {
    expect(esRespuestaVacia('  ')).toBe(true);
    expect(esRespuestaVacia([])).toBe(true);
    expect(esRespuestaVacia(undefined)).toBe(true);
    expect(esRespuestaVacia(['A'])).toBe(false);
    expect(esRespuestaVacia('x')).toBe(false);
  });

  it('conserva tipo fecha y requerida=false al editar', () => {
    const [p] = backendPreguntasToForm([{ id: 1, texto: 'F', tipo: 'fecha', requerida: false }]);
    expect(p.tipo).toBe('fecha');
    expect(p.requerida).toBe(false);
  });

  it('FULL_TEXT permite @ y - en títulos y opciones', () => {
    const filtro = createCharFilter(CharType.FULL_TEXT);
    expect(filtro('Encuesta 2026-2 contacto@unipamplona.edu.co ¿Sí?')).toBe('Encuesta 2026-2 contacto@unipamplona.edu.co ¿Sí?');
    expect(filtro('<script>')).toBe('script');
  });
});
