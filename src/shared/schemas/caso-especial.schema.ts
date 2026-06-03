import { z } from 'zod';
import { CharType, ERROR_MSGS } from '@/lib/validation';

export const casoEspecialCreateSchema = z.object({
  tipo: z.string().min(1, 'Selecciona un tipo'),
  novedad_id: z.string().min(1, 'Selecciona una novedad'),
  observaciones: z
    .string()
    .min(1, 'Requerido')
    .max(500, 'Máximo 500 caracteres')
    .regex(CharType.FULL_TEXT, ERROR_MSGS.FULL_TEXT),
});

export const historialRegistroSchema = z.object({
  accion: z.string().min(1, 'Selecciona una acción'),
  observaciones: z
    .string()
    .min(1, 'Requerido')
    .max(500, 'Máximo 500 caracteres')
    .regex(CharType.FULL_TEXT, ERROR_MSGS.FULL_TEXT),
});

export type CasoEspecialCreate = z.infer<typeof casoEspecialCreateSchema>;
export type HistorialRegistro = z.infer<typeof historialRegistroSchema>;
