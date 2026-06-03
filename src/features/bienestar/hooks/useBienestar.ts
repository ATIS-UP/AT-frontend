import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bienestarService } from '../services/bienestarService';
import { useNotificationStore } from '@/shared/stores/notification.store';

export function useTcbu(params?: { periodo_inicio?: string; periodo_fin?: string }) {
  return useQuery({
    queryKey: ['bienestar', 'tcbu', params ?? null],
    queryFn: () => bienestarService.getTcbu(params),
  });
}

export function useCargaTcbu() {
  const queryClient = useQueryClient();
  const notify = useNotificationStore.getState().add;

  return useMutation({
    mutationFn: (file: File) => bienestarService.cargaCsv(file),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bienestar'] });
      const hasErrors = data.errores.length > 0;
      notify({
        type: hasErrors ? 'warning' : 'success',
        message: `Carga completada: ${data.insertados} insertados, ${data.actualizados} actualizados${hasErrors ? `, ${data.errores.length} errores` : ''}`,
      });
    },
    onError: () => {
      notify({ type: 'error', message: 'Error al procesar el archivo' });
    },
  });
}
