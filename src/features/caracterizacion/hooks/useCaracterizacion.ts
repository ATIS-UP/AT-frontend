import { useQuery } from '@tanstack/react-query';
import { caracterizacionService } from '../services/caracterizacionService';

export function useSocioeconomica(periodo?: string) {
  return useQuery({
    queryKey: ['caracterizacion', 'socioeconomica', periodo ?? null],
    queryFn: () => caracterizacionService.socioeconomica(periodo),
  });
}

export function useProcedencia(periodo?: string) {
  return useQuery({
    queryKey: ['caracterizacion', 'procedencia', periodo ?? null],
    queryFn: () => caracterizacionService.procedencia(periodo),
  });
}

export function useGenero(periodo?: string) {
  return useQuery({
    queryKey: ['caracterizacion', 'genero', periodo ?? null],
    queryFn: () => caracterizacionService.genero(periodo),
  });
}
