import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { actividadesService } from '../services/actividadesService';
import type { ActividadFormData, ActividadListParams } from '../types/actividades.types';

export const useActividadesList = (params?: ActividadListParams) => {
  return useQuery({
    queryKey: ['actividades', params],
    queryFn: () => actividadesService.listar(params),
  });
};

export const useActividad = (id: string, enabled: boolean = false) => {
  return useQuery({
    queryKey: ['actividades', id],
    queryFn: () => actividadesService.obtener(id),
    enabled,
  });
};

export const useCrearActividad = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ActividadFormData) => actividadesService.crear(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actividades'] });
    },
  });
};

export const useActualizarActividad = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ActividadFormData> }) =>
      actividadesService.actualizar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actividades'] });
    },
  });
};

export const useEliminarActividad = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => actividadesService.eliminar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actividades'] });
    },
  });
};
