import { z } from 'zod';
import { CharType, ERROR_MSGS } from '@/lib/validation';

export const usuarioCreateSchema = z.object({
  nombre: z
    .string()
    .min(1, 'Requerido')
    .max(100, 'Máximo 100 caracteres')
    .regex(CharType.LETTERS, ERROR_MSGS.LETTERS),
  email: z
    .string()
    .min(1, 'Requerido')
    .max(100, 'Máximo 100 caracteres')
    .regex(CharType.EMAIL, ERROR_MSGS.EMAIL)
    .email('Email inválido')
    .endsWith('@unipamplona.edu.co', 'Debe ser email institucional'),
  password: z
    .string()
    .min(6, 'Mínimo 6 caracteres')
    .max(100, 'Máximo 100 caracteres'),
  rol: z.enum(['ADMINISTRADOR', 'DOCENTE', 'APOYO']),
  is_active: z.boolean().default(true),
});

export const usuarioUpdateSchema = z.object({
  nombre: z
    .string()
    .min(1, 'Requerido')
    .max(100, 'Máximo 100 caracteres')
    .regex(CharType.LETTERS, ERROR_MSGS.LETTERS)
    .optional(),
  email: z
    .string()
    .min(1, 'Requerido')
    .max(100, 'Máximo 100 caracteres')
    .regex(CharType.EMAIL, ERROR_MSGS.EMAIL)
    .email('Email inválido')
    .endsWith('@unipamplona.edu.co', 'Debe ser email institucional')
    .optional(),
  password: z.string().min(6, 'Mínimo 6 caracteres').max(100).optional(),
  rol: z.enum(['ADMINISTRADOR', 'DOCENTE', 'APOYO']).optional(),
  is_active: z.boolean().optional(),
});

export type UsuarioCreate = z.infer<typeof usuarioCreateSchema>;
export type UsuarioUpdate = z.infer<typeof usuarioUpdateSchema>;
