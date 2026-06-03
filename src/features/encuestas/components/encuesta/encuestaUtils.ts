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
  }));
}

export function emptyPregunta(): PreguntaForm {
  return { id: generateLocalId(), texto: '', tipo: 'texto_libre', opciones: undefined, requerida: true };
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
