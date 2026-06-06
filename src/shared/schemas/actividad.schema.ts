import { z } from 'zod';
import { CharType, ERROR_MSGS } from '@/lib/validation';

export const actividadCreateSchema = z.object({
  tipo: z.string().min(1, 'Selecciona un tipo'),
  modalidad: z.string().min(1, 'Selecciona una modalidad'),
  lugar_enlace: z
    .string()
    .min(1, 'Requerido')
    .max(500, 'Máximo 500 caracteres')
    .regex(CharType.ALPHANUMERIC, ERROR_MSGS.ALPHANUMERIC),
  fecha_inicio: z.string().min(1, 'Indica la fecha de inicio'),
  fecha_fin: z.string().min(1, 'Indica la fecha de fin'),
  encargado: z
    .string()
    .min(1, 'Requerido')
    .max(255, 'Máximo 255 caracteres')
    .regex(CharType.LETTERS, ERROR_MSGS.LETTERS),
  estado: z.string().optional(),
  descripcion: z
    .string()
    .min(1, 'Requerido')
    .max(500, 'Máximo 500 caracteres')
    .regex(CharType.FULL_TEXT, ERROR_MSGS.FULL_TEXT),
  observaciones: z
    .string()
    .max(1000, 'Máximo 1000 caracteres')
    .regex(CharType.FULL_TEXT, ERROR_MSGS.FULL_TEXT)
    .optional()
    .or(z.literal('')),
  anexos: z.string().optional(),
  enlace: z
    .string()
    .max(260, 'Máximo 260 caracteres')
    .regex(CharType.ALPHANUMERIC, ERROR_MSGS.ALPHANUMERIC)
    .optional()
    .or(z.literal('')),
});

export type ActividadCreate = z.infer<typeof actividadCreateSchema>;
