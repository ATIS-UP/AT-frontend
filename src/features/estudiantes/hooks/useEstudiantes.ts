import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { estudiantesService, EstudianteListParams } from '../services/estudiantesService';
import { useNotificationStore } from '@/shared/stores/notification.store';

const KEYS = {
  all: ['estudiantes'] as const,
  list: (params?: EstudianteListParams) => [...KEYS.all, 'list', params] as const,
  detail: (id: string) => [...KEYS.all, 'detail', id] as const,
  historial: (id: string) => [...KEYS.all, 'historial', id] as const,
};

export function useEstudiantes(params?: EstudianteListParams) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: () => estudiantesService.listar(params),
  });
}

export function useEstudiante(id: string) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: () => estudiantesService.obtener(id),
    enabled: !!id,
  });
}

export function useEstudianteHistorial(id: string) {
  return useQuery({
    queryKey: KEYS.historial(id),
    queryFn: () => estudiantesService.historial(id),
    enabled: !!id,
  });
}

export function useCrearEstudiante() {
  const queryClient = useQueryClient();
  const notify = useNotificationStore.getState().add;

  return useMutation({
    mutationFn: (data: Record<string, unknown>) => estudiantesService.crear(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.all });
      notify({ type: 'success', message: 'Estudiante creado correctamente' });
    },
    onError: () => {
      notify({ type: 'error', message: 'Error al crear estudiante' });
    },
  });
}

export function useActualizarEstudiante() {
  const queryClient = useQueryClient();
  const notify = useNotificationStore.getState().add;

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      estudiantesService.actualizar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.all });
      notify({ type: 'success', message: 'Estudiante actualizado correctamente' });
    },
    onError: () => {
      notify({ type: 'error', message: 'Error al actualizar estudiante' });
    },
  });
}

export function useEliminarEstudiante() {
  const queryClient = useQueryClient();
  const notify = useNotificationStore.getState().add;

  return useMutation({
    mutationFn: (id: string) => estudiantesService.eliminar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.all });
      notify({ type: 'success', message: 'Estudiante eliminado correctamente' });
    },
    onError: () => {
      notify({ type: 'error', message: 'Error al eliminar estudiante' });
    },
  });
}

export function useConteoRelaciones(id: string) {
  return useQuery({
    queryKey: [...KEYS.all, 'relaciones', id],
    queryFn: () => estudiantesService.obtenerConteoRelaciones(id),
    enabled: !!id,
  });
}

export function useCambiarEstadoEstudiante() {
  const queryClient = useQueryClient();
  const notify = useNotificationStore.getState().add;

  return useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: string }) =>
      estudiantesService.cambiarEstado(id, { estado }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: KEYS.all });
      notify({ type: 'success', message: `Estudiante cambiado a ${data.estado || 'nuevo estado'}` });
    },
    onError: () => {
      notify({ type: 'error', message: 'Error al cambiar estado del estudiante' });
    },
  });
}
