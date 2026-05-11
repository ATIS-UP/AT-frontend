import { z } from 'zod';

export const estudianteCreateSchema = z.object({
  codigo: z.string().min(1).max(20),
  nombres: z.string().min(1),
  apellidos: z.string().min(1),
  programa: z.string().min(1),
  semestre: z.number().int().min(1).max(15),
  email: z.string().email().endsWith('@unipamplona.edu.co').optional().or(z.literal('')),
  documento: z.string().optional(),
  telefono: z.string().optional(),
  estado: z.enum(['ACTIVO', 'INACTIVO', 'GRADUADO', 'SUSPENDIDO']).default('ACTIVO'),
});

export type EstudianteCreate = z.infer<typeof estudianteCreateSchema>;
