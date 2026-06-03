import { z } from 'zod';
import { CharType, ERROR_MSGS } from '@/lib/validation';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Requerido')
    .regex(CharType.EMAIL, ERROR_MSGS.EMAIL)
    .email('Email inválido')
    .endsWith('@unipamplona.edu.co', 'Debe ser email institucional'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

export const cambiarPasswordSchema = z.object({
  password_actual: z.string().min(1, 'Requerido'),
  password_nueva: z.string().min(8, 'Mínimo 8 caracteres'),
  confirmar_password: z.string().min(8),
}).refine((data) => data.password_nueva === data.confirmar_password, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmar_password'],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CambiarPasswordInput = z.infer<typeof cambiarPasswordSchema>;
