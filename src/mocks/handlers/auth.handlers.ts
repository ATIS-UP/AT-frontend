import { http, HttpResponse } from 'msw';
import { User, Rol } from '../../shared/types/roles.types';

export const authHandlers = [
  http.post('/api/auth/login', async ({ request }) => {
    // Para simplificar, aceptamos cualquier credencial.
    const user: User = {
      id: '1',
      name: 'Director STUB',
      email: 'director@unipamplona.edu.co',
      rol: Rol.DIRECTOR
    };
    
    return HttpResponse.json({
      token: 'fake-jwt-token-12345',
      user
    });
  }),

  http.post('/api/auth/logout', () => {
    return HttpResponse.json({ success: true });
  }),

  http.get('/api/auth/me', () => {
    const user: User = {
      id: '1',
      name: 'Director STUB',
      email: 'director@unipamplona.edu.co',
      rol: Rol.DIRECTOR
    };
    return HttpResponse.json(user);
  }),
];
