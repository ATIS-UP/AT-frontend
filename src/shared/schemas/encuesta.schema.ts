import { z } from 'zod';
import { CharType, ERROR_MSGS } from '@/src/lib/validation';

export const preguntaSchema = z.object({
  id: z.number(),
  texto: z
    .string()
    .min(1, 'Requerido')
    .max(500, 'Máximo 500 caracteres')
    .regex(CharType.FULL_TEXT, ERROR_MSGS.FULL_TEXT),
  tipo: z.enum(['opcion_multiple', 'texto_libre', 'escala_likert']),
  opciones: z.array(z.string()).min(2).optional(),
  requerida: z.boolean().default(true),
});

export const encuestaCreateSchema = z.object({
  titulo: z
    .string()
    .min(5, 'Mínimo 5 caracteres')
    .max(255, 'Máximo 255 caracteres')
    .regex(CharType.ALPHANUMERIC, ERROR_MSGS.ALPHANUMERIC),
  descripcion: z
    .string()
    .max(500, 'Máximo 500 caracteres')
    .regex(CharType.FULL_TEXT, ERROR_MSGS.FULL_TEXT)
    .optional()
    .or(z.literal('')),
  preguntas: z.array(preguntaSchema).min(1, 'Agrega al menos una pregunta'),
  periodo: z.string().optional(),
});

export type Pregunta = z.infer<typeof preguntaSchema>;
export type EncuestaCreate = z.infer<typeof encuestaCreateSchema>;
