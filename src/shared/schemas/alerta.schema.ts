import { z } from 'zod';

export const alertaCreateSchema = z.object({
  estudiante_id: z.string().uuid(),
  materia_id: z.string().uuid().optional(),
  nivel_riesgo: z.enum(['ROJO', 'AMARILLO', 'VERDE']),
  descripcion: z.string().max(500).optional(),
  periodo: z.string().regex(/^\d{4}-[12]$/, 'Formato: YYYY-S'),
});

export type AlertaCreate = z.infer<typeof alertaCreateSchema>;
