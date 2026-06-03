import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import { apiClient } from '@/lib/api-client';
import { encuestasService } from '../encuestasService';

describe('encuestasService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('listar should return encuestas', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      total: 1, encuestas: [{ id: 'e1', titulo: 'Test', estado: 'BORRADOR' }],
    });

    const result = await encuestasService.listar();
    expect((result as any).encuestas).toBeDefined();
    expect((result as any).encuestas.length).toBeGreaterThan(0);
  });

  it('verificarEstudiante with valid documento returns student data', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      existe: true, ya_respondio: false, puede_responder: true,
      estudiante_nombre: 'Juan Pérez', estudiante_id: 'est-1', preguntas: [],
    });

    const result = await encuestasService.verificarEstudiante('e1', '12345678');
    expect(result.existe).toBe(true);
    expect(result.puede_responder).toBe(true);
    expect(result.estudiante_nombre).toBe('Juan Pérez');
  });

  it('verificarEstudiante with invalid documento returns not found', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      existe: false, ya_respondio: false, puede_responder: false,
      estudiante_nombre: null, estudiante_id: null,
    });

    const result = await encuestasService.verificarEstudiante('e1', '99999999');
    expect(result.existe).toBe(false);
    expect(result.puede_responder).toBe(false);
  });

  it('responderPublico returns response', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({ id: 'resp-1' });

    const result = await encuestasService.responderPublico('e1', {
      documento: '12345678',
      respuestas: [{ pregunta_id: 1, valor: '3' }],
    });
    expect(result).toBeDefined();
  });
});
