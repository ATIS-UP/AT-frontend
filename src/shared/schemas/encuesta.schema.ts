import { z } from 'zod';

export const preguntaSchema = z.object({
  id: z.number(),
  texto: z.string().min(1),
  tipo: z.enum(['opcion_multiple', 'texto_libre', 'escala_likert']),
  opciones: z.array(z.string()).min(2).optional(),
  requerida: z.boolean().default(true),
});

export const encuestaCreateSchema = z.object({
  titulo: z.string().min(5).max(255),
  descripcion: z.string().optional(),
  preguntas: z.array(preguntaSchema).min(1),
  periodo: z.string().optional(),
});

export type Pregunta = z.infer<typeof preguntaSchema>;
export type EncuestaCreate = z.infer<typeof encuestaCreateSchema>;
