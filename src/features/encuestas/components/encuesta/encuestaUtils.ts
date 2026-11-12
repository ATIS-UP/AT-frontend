import type { PreguntaForm } from '@/shared/schemas/encuesta.schema';
import { PREGUNTA_TIPOS } from '@/shared/schemas/encuesta.schema';

export const PREGUNTA_MAX_LENGTH = 500;
export const OPCION_MAX_LENGTH = 200;

export function generateLocalId(): string {
  return `q_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}

export function toLocalDateTimeInput(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fromLocalDateTimeInput(local: string): string | null {
  if (!local) return null;
  const d = new Date(local);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export function backendPreguntasToForm(preguntas: any[]): PreguntaForm[] {
  if (!Array.isArray(preguntas) || preguntas.length === 0) {
    return [emptyPregunta()];
  }
  return preguntas.map((p: any) => ({
    id: typeof p.id === 'number' ? `b_${p.id}` : generateLocalId(),
    texto: typeof p.texto === 'string' ? p.texto : '',
    tipo: (PREGUNTA_TIPOS as readonly string[]).includes(p.tipo) ? p.tipo : 'texto_libre',
    opciones: Array.isArray(p.opciones) ? p.opciones.map((o: any) => String(o)) : undefined,
    requerida: typeof p.requerida === 'boolean' ? p.requerida : true,
    campo: typeof p.campo === 'string' ? p.campo : undefined,
    editable: typeof p.editable === 'boolean' ? p.editable : undefined,
  }));
}

export function emptyPregunta(): PreguntaForm {
  return { id: generateLocalId(), texto: '', tipo: 'texto_libre', opciones: undefined, requerida: true };
}

/** True when an answer is empty (blank string, empty multi-select or missing). */
export function esRespuestaVacia(valor: unknown): boolean {
  if (valor == null) return true;
  if (Array.isArray(valor)) return valor.length === 0;
  return typeof valor === 'string' ? valor.trim() === '' : false;
}

/** Input mask for date answers: keeps digits and inserts slashes -> DD/MM/AAAA. */
export function formatearFechaInput(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

/** True when value is a real calendar date written as DD/MM/AAAA. */
export function esFechaValida(valor: string): boolean {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(valor.trim());
  if (!m) return false;
  const [dia, mes, anio] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const fecha = new Date(anio, mes - 1, dia);
  return fecha.getFullYear() === anio && fecha.getMonth() === mes - 1 && fecha.getDate() === dia;
}

export function validatePreguntas(preguntas: PreguntaForm[]): string | null {
  if (preguntas.length === 0) return 'Agregue al menos una pregunta';
  for (let i = 0; i < preguntas.length; i++) {
    const p = preguntas[i];
    if (!p.texto.trim()) return `La pregunta ${i + 1} no puede estar vacía`;
    if (p.tipo === 'opcion_multiple') {
      const opciones = p.opciones ?? [];
      if (opciones.length < 2) return `La pregunta ${i + 1} de opción múltiple requiere al menos 2 opciones`;
      if (opciones.some((o) => !o.trim())) return `La pregunta ${i + 1} tiene opciones vacías`;
    }
  }
  return null;
}
