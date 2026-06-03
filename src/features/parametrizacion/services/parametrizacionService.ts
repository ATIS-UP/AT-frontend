import { apiClient } from '@/lib/api-client';

export interface Parametro {
  id: string;
  clave: string;
  valor: string;
  descripcion?: string;
  tipo?: string;
  updated_at?: string;
  created_at?: string;
}

export interface ParametroGroup {
  grupo: string;
  parametros: Parametro[];
}

export const parametrizacionService = {
  listar: () =>
    apiClient.get<ParametroGroup[]>('/api/parametrizacion'),

  obtener: (id: string) =>
    apiClient.get<Parametro>(`/api/parametrizacion/${id}`),

  actualizar: (id: string, valor: string) =>
    apiClient.put<Parametro>(`/api/parametrizacion/${id}`, { valor }),
};
