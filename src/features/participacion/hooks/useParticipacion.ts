import { useQuery } from '@tanstack/react-query';
import { participacionService } from '../services/participacionService';

export function useProcedencia(periodo?: string) {
  return useQuery({
    queryKey: ['participacion', 'procedencia', periodo ?? null],
    queryFn: () => participacionService.procedencia(periodo),
  });
}

export function useGenero(periodo?: string) {
  return useQuery({
    queryKey: ['participacion', 'genero', periodo ?? null],
    queryFn: () => participacionService.genero(periodo),
  });
}

export function useEstrato(periodo?: string) {
  return useQuery({
    queryKey: ['participacion', 'estrato', periodo ?? null],
    queryFn: () => participacionService.estrato(periodo),
  });
}
