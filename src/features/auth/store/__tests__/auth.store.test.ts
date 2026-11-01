import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Rol } from '@/shared/types/roles.types';

vi.mock('@/lib/api-client', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '../auth.store';

describe('auth.store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false });
  });

  describe('loginWithCredentials', () => {
    it('should store tokens and user on successful login', async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
        usuario: { id: '1', email: 'admin@unipamplona.edu.co', nombre: 'Admin', rol: Rol.ADMINISTRADOR },
      });

      const result = await useAuthStore.getState().loginWithCredentials('admin', 'password');

      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect((result as any).nombre).toBe('Admin');
      expect(localStorage.getItem('sat_access_token')).toBe('test-access-token');
    });

    it('should throw on invalid login', async () => {
      vi.mocked(apiClient.post).mockRejectedValueOnce(new Error('Invalid credentials'));

      await expect(
        useAuthStore.getState().loginWithCredentials('bad', 'wrong')
      ).rejects.toBeDefined();

      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });

  describe('logout', () => {
    it('should clear tokens on logout', async () => {
      vi.stubGlobal('location', { href: '', origin: 'http://localhost' });

      useAuthStore.setState({
        user: { id: '1', email: 'a@test.com', nombre: 'A', rol: Rol.ADMINISTRADOR },
        isAuthenticated: true,
      });
      localStorage.setItem('sat_access_token', 'x');

      const { logout } = useAuthStore.getState();
      await logout();

      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(localStorage.getItem('sat_access_token')).toBeNull();
    });
  });

  describe('login (direct)', () => {
    it('should store tokens and authenticate without API call', () => {
      const user = { id: '1', email: 'a@test.com', nombre: 'A', rol: Rol.ADMINISTRADOR };
      useAuthStore.getState().login(
        { access_token: 'a', refresh_token: 'r' },
        user
      );

      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().user).toEqual(user);
      expect(localStorage.getItem('sat_access_token')).toBe('a');
      expect(localStorage.getItem('sat_refresh_token')).toBe('r');
    });
  });

  describe('restoreSession', () => {
    it('should set isLoading=false when no token is present', async () => {
      useAuthStore.setState({ isLoading: true });
      await useAuthStore.getState().restoreSession();
      expect(useAuthStore.getState().isLoading).toBe(false);
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });

    it('should restore user when /api/auth/me succeeds', async () => {
      localStorage.setItem('sat_access_token', 'valid');
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        id: '1',
        email: 'a@test.com',
        nombre: 'A',
        rol: Rol.ADMINISTRADOR,
      });

      await useAuthStore.getState().restoreSession();

      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().user?.email).toBe('a@test.com');
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('should clear tokens when /api/auth/me fails (expired/invalid)', async () => {
      localStorage.setItem('sat_access_token', 'expired');
      localStorage.setItem('sat_refresh_token', 'expired-r');
      vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Unauthorized'));

      await useAuthStore.getState().restoreSession();

      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().isLoading).toBe(false);
      expect(localStorage.getItem('sat_access_token')).toBeNull();
      expect(localStorage.getItem('sat_refresh_token')).toBeNull();
    });
  });
});
