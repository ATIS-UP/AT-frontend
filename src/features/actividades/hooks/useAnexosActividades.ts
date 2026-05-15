import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { anexosActividadesService } from '../services/anexosActividadesService';

export const useAnexosActividad = (actividadId: string, enabled: boolean = false) => {
  return useQuery({
    queryKey: ['anexos-actividad', actividadId],
    queryFn: () => anexosActividadesService.listar(actividadId),
    enabled,
  });
};

export const useSubirAnexo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ actividadId, file }: { actividadId: string; file: File }) =>
      anexosActividadesService.subir(actividadId, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['anexos-actividad', variables.actividadId] });
    },
  });
};

export const useEliminarAnexo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ anexoId, actividadId }: { anexoId: string; actividadId: string }) =>
      anexosActividadesService.eliminar(anexoId).then(() => ({ anexoId, actividadId })),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['anexos-actividad', result.actividadId] });
    },
  });
};
