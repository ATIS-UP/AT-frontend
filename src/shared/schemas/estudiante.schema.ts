import { z } from 'zod';
import { CharType, ERROR_MSGS } from '@/lib/validation';

export const estudianteCreateSchema = z.object({
  codigo: z
    .string()
    .min(1, 'Requerido')
    .max(20, 'Máximo 20 caracteres')
    .regex(CharType.DIGITS, ERROR_MSGS.DIGITS),
  nombres: z
    .string()
    .min(1, 'Requerido')
    .max(100, 'Máximo 100 caracteres')
    .regex(CharType.LETTERS, ERROR_MSGS.LETTERS),
  apellidos: z
    .string()
    .min(1, 'Requerido')
    .max(100, 'Máximo 100 caracteres')
    .regex(CharType.LETTERS, ERROR_MSGS.LETTERS),
  programa: z
    .string()
    .min(1, 'Requerido')
    .max(100, 'Máximo 100 caracteres')
    .regex(CharType.ALPHANUMERIC, ERROR_MSGS.ALPHANUMERIC),
  semestre: z.number().int().min(1).max(15),
  email: z
    .string()
    .max(100, 'Máximo 100 caracteres')
    .regex(CharType.EMAIL, ERROR_MSGS.EMAIL)
    .email('Email inválido')
    .endsWith('@unipamplona.edu.co', 'Debe ser email institucional')
    .optional()
    .or(z.literal('')),
  documento: z
    .string()
    .max(100, 'Máximo 100 caracteres')
    .regex(CharType.DIGITS, ERROR_MSGS.DIGITS)
    .optional()
    .or(z.literal('')),
  telefono: z
    .string()
    .max(100, 'Máximo 100 caracteres')
    .regex(CharType.DIGITS, ERROR_MSGS.DIGITS)
    .optional()
    .or(z.literal('')),
  estado: z.enum(['ACTIVO', 'INACTIVO', 'GRADUADO', 'SUSPENDIDO']).default('ACTIVO'),
});

export type EstudianteCreate = z.infer<typeof estudianteCreateSchema>;
