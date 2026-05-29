import { z } from 'zod';
import { CharType, ERROR_MSGS } from '@/src/lib/validation';

export const alertaCreateSchema = z.object({
  estudiante_id: z.string().min(1, 'Requerido'),
  materia_id: z.string().uuid().optional().or(z.literal('')),
  nivel_riesgo: z.enum(['ROJO', 'AMARILLO', 'VERDE']),
  descripcion: z
    .string()
    .max(500, 'Máximo 500 caracteres')
    .regex(CharType.FULL_TEXT, ERROR_MSGS.FULL_TEXT)
    .optional()
    .or(z.literal('')),
  periodo: z.string().regex(/^\d{4}-[12]$/, 'Formato: YYYY-S'),
});

export const seguimientoAlertaSchema = z.object({
  tipo: z.string().min(1, 'Requerido'),
  descripcion: z
    .string()
    .min(1, 'Requerido')
    .max(500, 'Máximo 500 caracteres')
    .regex(CharType.FULL_TEXT, ERROR_MSGS.FULL_TEXT),
  resultado: z
    .string()
    .max(500, 'Máximo 500 caracteres')
    .regex(CharType.FULL_TEXT, ERROR_MSGS.FULL_TEXT)
    .optional()
    .or(z.literal('')),
});

export const cambioEstadoAlertaSchema = z.object({
  nuevoEstado: z.enum(['PENDIENTE', 'EN_PROCESO', 'RESUELTO', 'DESCARTADO']),
});

export type AlertaCreate = z.infer<typeof alertaCreateSchema>;
export type SeguimientoAlerta = z.infer<typeof seguimientoAlertaSchema>;
export type CambioEstadoAlerta = z.infer<typeof cambioEstadoAlertaSchema>;
