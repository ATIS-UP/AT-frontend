import { useQuery } from '@tanstack/react-query';
import { monitoreoService } from '../services/monitoreoService';

export function useMateriasDificultad(periodo?: string) {
  return useQuery({
    queryKey: ['monitoreo', 'materias-dificultad', periodo ?? null],
    queryFn: () => monitoreoService.materiasDificultad(periodo),
  });
}
