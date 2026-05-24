import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { casosEspecialesService } from '../services/casosEspecialesService';
import type { RegistroCreate, RegistroUpdate, HistorialCreate } from '../types/casosEspeciales.types';

export const useBuscarEstudiante = (q: string, pagina: number = 1, enabled: boolean = false, tipo?: string) => {
  return useQuery({
    queryKey: ['casos-especiales', 'buscar', q, pagina, tipo ?? ''],
    queryFn: () => casosEspecialesService.buscarEstudiante(q, pagina, tipo),
    enabled: enabled && q.length >= 1,
  });
};

export const useListarRegistros = () => {
  return useQuery({
    queryKey: ['casos-especiales', 'listar', 'ACTIVO'],
    queryFn: () => casosEspecialesService.listar(1, 500, 'ACTIVO'),
    staleTime: 30000,
  });
};

export const useCrearRegistro = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RegistroCreate) => casosEspecialesService.crear(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['casos-especiales'] });
    },
  });
};

export const useObtenerRegistro = (id: string, enabled: boolean = false) => {
  return useQuery({
    queryKey: ['casos-especiales', 'obtener', id],
    queryFn: () => casosEspecialesService.obtener(id),
    enabled,
  });
};

export const useActualizarRegistro = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RegistroUpdate }) =>
      casosEspecialesService.actualizar(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['casos-especiales'] });
      queryClient.invalidateQueries({ queryKey: ['casos-especiales', 'obtener', variables.id] });
    },
  });
};

export const useObtenerHistorial = (registroId: string, enabled: boolean = false) => {
  return useQuery({
    queryKey: ['casos-especiales', 'historial', registroId],
    queryFn: () => casosEspecialesService.obtenerHistorial(registroId),
    enabled,
  });
};

export const useAgregarHistorial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: HistorialCreate }) =>
      casosEspecialesService.agregarHistorial(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['casos-especiales'] });
      queryClient.invalidateQueries({ queryKey: ['casos-especiales', 'historial', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['casos-especiales', 'obtener', variables.id] });
    },
  });
};

export const useEliminarRegistro = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => casosEspecialesService.eliminar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['casos-especiales'] });
    },
  });
};