import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { casosEspecialesService } from '../services/casosEspecialesService';

export function useNovedadesCasos(tipo_caso?: string) {
  return useQuery({
    queryKey: ['novedades-casos', tipo_caso ?? 'all'],
    queryFn: () => casosEspecialesService.listarNovedades(tipo_caso),
  });
}

export function useCrearNovedad() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { tipo_caso: string; nombre: string }) =>
      casosEspecialesService.crearNovedad(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['novedades-casos'] });
    },
  });
}

export function useActualizarNovedad() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { nombre?: string; activo?: boolean } }) =>
      casosEspecialesService.actualizarNovedad(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['novedades-casos'] });
    },
  });
}

export function useEliminarNovedad() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => casosEspecialesService.eliminarNovedad(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['novedades-casos'] });
    },
  });
}
