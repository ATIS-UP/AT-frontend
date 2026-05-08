export enum Rol {
  ADMINISTRADOR = 'ADMINISTRADOR',
  DOCENTE = 'DOCENTE',
  APOYO = 'APOYO',
}

export interface User {
  id: string;
  name: string;
  email: string;
  rol: Rol;
}