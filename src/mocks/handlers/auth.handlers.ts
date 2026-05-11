import { http, HttpResponse } from 'msw';
import { Rol } from '../../shared/types/roles.types';

// mock data matching the real backend LoginResponse structure
const mockUser = {
  id: '1',
  email: 'admin@unipamplona.edu.co',
  nombre: 'Admin STUB',
  rol: Rol.ADMINISTRADOR,
  is_active: true,
  is_verified: true,
  last_login: '2025-01-15T10:30:00Z',
  created_at: '2025-01-01T00:00:00Z',
};

export const authHandlers = [
  http.post('/api/auth/login', async () => {
    return HttpResponse.json({
      access_token: 'fake-jwt-access-token-12345',
      refresh_token: 'fake-jwt-refresh-token-67890',
      token_type: 'bearer',
      usuario: mockUser,
    });
  }),

  http.post('/api/auth/logout', () => {
    return HttpResponse.json({ message: 'Logout exitoso' });
  }),

  http.get('/api/auth/me', () => {
    return HttpResponse.json(mockUser);
  }),

  http.get('/api/auth/permisos', () => {
    return HttpResponse.json({
      usuario_id: '1',
      rol: Rol.ADMINISTRADOR,
      permisos: [
        'ver_estudiantes', 'crear_estudiante', 'editar_estudiante',
        'ver_alertas', 'crear_alerta', 'editar_alerta',
        'ver_dashboard', 'gestionar_usuarios',
      ],
    });
  }),
];
