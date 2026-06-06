import { z } from 'zod';
import { CharType, ERROR_MSGS } from '@/lib/validation';

export const PREGUNTA_TIPOS = ['texto_libre', 'opcion_multiple', 'opcion_multiple_multi', 'escala_likert'] as const;
export type PreguntaTipo = (typeof PREGUNTA_TIPOS)[number];

export const preguntaBackendSchema = z.object({
  id: z.number().optional(),
  texto: z
    .string()
    .min(1, 'Requerido')
    .max(500, 'Máximo 500 caracteres')
    .regex(CharType.FULL_TEXT, ERROR_MSGS.FULL_TEXT),
  tipo: z.enum(PREGUNTA_TIPOS),
  opciones: z.array(z.string().min(1)).min(2).optional(),
  requerida: z.boolean().default(true),
  campo: z.string().optional(),
  editable: z.boolean().default(true),
});

export const preguntaFormSchema = z.object({
  id: z.string(),
  texto: z
    .string()
    .min(1, 'La pregunta no puede estar vacía')
    .max(500, 'Máximo 500 caracteres'),
  tipo: z.enum(PREGUNTA_TIPOS),
  opciones: z.array(z.string().min(1)).optional(),
  requerida: z.boolean().default(true),
  campo: z.string().optional(),
  editable: z.boolean().optional(),
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
  preguntas: z.array(preguntaBackendSchema).min(1, 'Agrega al menos una pregunta'),
  periodo: z.string().optional(),
});

export const encuestaUpdateSchema = z.object({
  titulo: z
    .string()
    .min(5, 'Mínimo 5 caracteres')
    .max(255, 'Máximo 255 caracteres')
    .regex(CharType.ALPHANUMERIC, ERROR_MSGS.ALPHANUMERIC)
    .optional(),
  descripcion: z
    .string()
    .max(500, 'Máximo 500 caracteres')
    .regex(CharType.FULL_TEXT, ERROR_MSGS.FULL_TEXT)
    .optional()
    .or(z.literal('')),
  preguntas: z.array(preguntaBackendSchema).min(1, 'Agrega al menos una pregunta').optional(),
  periodo: z.string().optional(),
  fecha_fin: z.string().nullable().optional(),
});

export const encuestaBackendSchema = z.object({
  id: z.string(),
  titulo: z.string(),
  descripcion: z.string().nullable().optional(),
  preguntas: z.array(z.any()).default([]),
  estado: z.string(),
  periodo: z.string().nullable().optional(),
  fecha_inicio: z.string().nullable().optional(),
  fecha_fin: z.string().nullable().optional(),
  es_publica: z.boolean().optional(),
  total_respuestas: z.number().optional(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
});

export type Pregunta = z.infer<typeof preguntaBackendSchema>;
export type EncuestaCreate = z.infer<typeof encuestaCreateSchema>;
export type EncuestaUpdate = z.infer<typeof encuestaUpdateSchema>;
export type Encuesta = z.infer<typeof encuestaBackendSchema>;
export type PreguntaForm = z.infer<typeof preguntaFormSchema>;

export const PREGUNTA_TIPO_LABELS: Record<PreguntaTipo, string> = {
  texto_libre: 'Texto libre',
  opcion_multiple: 'Opción múltiple',
  opcion_multiple_multi: 'Opción múltiple (multi-respuesta)',
  escala_likert: 'Escala 1-5',
};

export const CAMPO_ESTUDIANTE = {
  email:             { label: 'Email',              tipoUI: 'texto_libre' },
  telefono:          { label: 'Teléfono',           tipoUI: 'texto_libre' },
  programa:          { label: 'Programa académico', tipoUI: 'texto_libre' },
  semestre:          { label: 'Semestre',           tipoUI: 'opcion_multiple' },
  estrato:           { label: 'Estrato socioeconómico', tipoUI: 'opcion_multiple' },
  procedencia:       { label: 'Procedencia',        tipoUI: 'opcion_multiple' },
  genero:            { label: 'Género',             tipoUI: 'opcion_multiple' },
  ingreso_familiar:  { label: 'Ingreso familiar ($)', tipoUI: 'texto_libre' },
} as const;

export const READONLY_CAMPOS = ['programa', 'semestre'] as const;

export type CampoEstudiante = keyof typeof CAMPO_ESTUDIANTE;
