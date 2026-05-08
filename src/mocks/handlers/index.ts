import { authHandlers } from './auth.handlers';
import { alertasHandlers } from './alertas.handlers';

export const handlers = [
  ...authHandlers,
  ...alertasHandlers,
];
