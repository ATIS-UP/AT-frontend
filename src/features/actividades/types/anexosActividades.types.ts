export interface AnexoActividad {
  id: string;
  actividad_id: string;
  nombre: string;
  tipo: string;
  url: string;
  uploaded_by: string;
  created_at: string | null;
}

export interface AnexoActividadListResponse {
  anexos: AnexoActividad[];
  total: number;
}
