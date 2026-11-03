import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { casosEspecialesService } from '../services/casosEspecialesService';

const KEYS = {
  list: (registroId: string) => ['evidencias-caso', registroId] as const,
  archivo: (evidenciaId: string) => ['evidencias-caso', 'archivo', evidenciaId] as const,
};

export function useEvidenciasCaso(registroId: string) {
  return useQuery({
    queryKey: KEYS.list(registroId),
    queryFn: () => casosEspecialesService.listarEvidencias(registroId),
  });
}

// Las fotografías no se modifican una vez subidas: no hace falta volver a descargarlas.
export function useArchivoEvidencia(evidenciaId: string) {
  return useQuery({
    queryKey: KEYS.archivo(evidenciaId),
    queryFn: () => casosEspecialesService.obtenerArchivoEvidencia(evidenciaId),
    staleTime: Infinity,
    retry: false,
  });
}

export function useSubirEvidencia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ registroId, file }: { registroId: string; file: File }) =>
      casosEspecialesService.subirEvidencia(registroId, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: KEYS.list(variables.registroId) });
    },
  });
}

export function useEliminarEvidencia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ evidenciaId, registroId }: { evidenciaId: string; registroId: string }) =>
      casosEspecialesService.eliminarEvidencia(evidenciaId).then(() => ({ evidenciaId, registroId })),
    onSuccess: (result) => {
      queryClient.removeQueries({ queryKey: KEYS.archivo(result.evidenciaId) });
      queryClient.invalidateQueries({ queryKey: KEYS.list(result.registroId) });
    },
  });
}
