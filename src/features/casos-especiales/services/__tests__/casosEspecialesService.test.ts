import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    upload: vi.fn(),
    downloadBlob: vi.fn(),
    delete: vi.fn(),
  },
}));

import { apiClient } from '@/lib/api-client';
import { casosEspecialesService } from '../casosEspecialesService';

describe('casosEspecialesService - evidencias', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('listarEvidencias consulta las evidencias del registro', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ evidencias: [], total: 0 });

    const result = await casosEspecialesService.listarEvidencias('reg-1');

    expect(apiClient.get).toHaveBeenCalledWith('/api/registros-casos/reg-1/evidencias');
    expect(result.total).toBe(0);
  });

  it('subirEvidencia usa upload (multipart con refresh de token)', async () => {
    const file = new File(['x'], 'foto.png', { type: 'image/png' });
    vi.mocked(apiClient.upload).mockResolvedValueOnce({ id: 'ev-1' });

    await casosEspecialesService.subirEvidencia('reg-1', file);

    expect(apiClient.upload).toHaveBeenCalledWith('/api/registros-casos/reg-1/evidencias', file);
  });

  it('obtenerArchivoEvidencia devuelve solo el blob', async () => {
    const blob = new Blob(['x'], { type: 'image/png' });
    vi.mocked(apiClient.downloadBlob).mockResolvedValueOnce({ blob, filename: 'foto.png' });

    const result = await casosEspecialesService.obtenerArchivoEvidencia('ev-1');

    expect(apiClient.downloadBlob).toHaveBeenCalledWith('/api/registros-casos/evidencias/ev-1/archivo');
    expect(result).toBe(blob);
  });

  it('eliminarEvidencia llama al endpoint de la evidencia', async () => {
    vi.mocked(apiClient.delete).mockResolvedValueOnce(undefined);

    await casosEspecialesService.eliminarEvidencia('ev-1');

    expect(apiClient.delete).toHaveBeenCalledWith('/api/registros-casos/evidencias/ev-1');
  });
});
