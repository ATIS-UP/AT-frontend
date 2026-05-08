export enum Rol {
  DOCENTE = 'DOCENTE',
  DIRECTOR = 'DIRECTOR',
  ADMINISTRADOR = 'ADMINISTRADOR',
}

export interface User {
  id: string;
  name: string;
  email: string;
  rol: Rol;
}