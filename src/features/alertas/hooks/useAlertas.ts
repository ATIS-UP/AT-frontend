import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { alertasService, AlertaListParams } from '../services/alertasService';
import { useNotificationStore } from '@/shared/stores/notification.store';

const ALL_KEY = ['alertas'] as const;

const KEYS = {
  all: ALL_KEY,
  list: (params?: AlertaListParams) => [...ALL_KEY, 'list', params] as const,
  stats: [...ALL_KEY, 'stats'] as const,
  detail: (id: string) => [...ALL_KEY, 'detail', id] as const,
  actividades: (id: string) => [...ALL_KEY, 'actividades', id] as const,
};

export function useAlertas(params?: AlertaListParams) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: () => alertasService.listar(params),
    placeholderData: keepPreviousData,
  });
}

export function useAlertasStats() {
  return useQuery({
    queryKey: KEYS.stats,
    queryFn: () => alertasService.stats(),
    placeholderData: keepPreviousData,
  });
}

export function useAlerta(id: string) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: () => alertasService.obtener(id),
    enabled: !!id,
  });
}

export function useCrearAlerta() {
  const queryClient = useQueryClient();
  const notify = useNotificationStore.getState().add;

  return useMutation({
    mutationFn: (data: Record<string, unknown>) => alertasService.crear(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      notify({ type: 'success', message: 'Alerta creada correctamente' });
    },
    onError: (error: Error) => {
      const apiError = error as unknown as Record<string, string>;
      notify({ type: 'error', message: apiError?.message || 'Error al crear la alerta' });
    },
  });
}

export function useCambiarEstadoAlerta() {
  const queryClient = useQueryClient();
  const notify = useNotificationStore.getState().add;

  return useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: string }) =>
      alertasService.cambiarEstado(id, estado),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      notify({ type: 'success', message: 'Estado actualizado' });
    },
    onError: () => {
      notify({ type: 'error', message: 'Error al cambiar estado' });
    },
  });
}

export function useAlertaActividades(alertaId: string) {
  return useQuery({
    queryKey: KEYS.actividades(alertaId),
    queryFn: () => alertasService.listarActividades(alertaId),
    enabled: !!alertaId,
  });
}

export function useEliminarAlerta() {
  const queryClient = useQueryClient();
  const notify = useNotificationStore.getState().add;

  return useMutation({
    mutationFn: (id: string) => alertasService.eliminar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      notify({ type: 'success', message: 'Alerta eliminada correctamente' });
    },
    onError: () => {
      notify({ type: 'error', message: 'Error al eliminar la alerta' });
    },
  });
}

export function useCrearActividad() {
  const queryClient = useQueryClient();
  const notify = useNotificationStore.getState().add;

  return useMutation({
    mutationFn: ({ alertaId, data }: { alertaId: string; data: Record<string, unknown> }) =>
      alertasService.crearActividad(alertaId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      notify({ type: 'success', message: 'Actividad registrada correctamente' });
    },
    onError: () => {
      notify({ type: 'error', message: 'Error al registrar actividad' });
    },
  });
}
