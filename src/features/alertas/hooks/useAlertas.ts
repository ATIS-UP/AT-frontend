import { useQuery } from '@tanstack/react-query';
import { alertasService } from '../services/alertas.service';

export const useAlertas = () => {
  return useQuery({
    queryKey: ['alertas'],
    queryFn: () => alertasService.getAlertas(),
  });
};

export const useAlertasStats = () => {
  return useQuery({
    queryKey: ['alertas-stats'],
    queryFn: () => alertasService.getStats(),
  });
};
