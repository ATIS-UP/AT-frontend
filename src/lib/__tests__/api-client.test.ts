import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { apiClient, isRetryableStatus, computeBackoff, MAX_RETRIES } from '../api-client';

describe('api-client retry helpers', () => {
  describe('isRetryableStatus', () => {
    it('returns true for 5xx server errors', () => {
      expect(isRetryableStatus(500)).toBe(true);
      expect(isRetryableStatus(502)).toBe(true);
      expect(isRetryableStatus(503)).toBe(true);
      expect(isRetryableStatus(504)).toBe(true);
    });

    it('returns true for 408 (Request Timeout) and 429 (Too Many Requests)', () => {
      expect(isRetryableStatus(408)).toBe(true);
      expect(isRetryableStatus(429)).toBe(true);
    });

    it('returns false for 2xx success and 3xx redirect', () => {
      expect(isRetryableStatus(200)).toBe(false);
      expect(isRetryableStatus(204)).toBe(false);
      expect(isRetryableStatus(301)).toBe(false);
    });

    it('returns false for 4xx client errors (except 408/429)', () => {
      expect(isRetryableStatus(400)).toBe(false);
      expect(isRetryableStatus(401)).toBe(false);
      expect(isRetryableStatus(403)).toBe(false);
      expect(isRetryableStatus(404)).toBe(false);
      expect(isRetryableStatus(422)).toBe(false);
    });
  });

  describe('computeBackoff', () => {
    it('produces exponential delay with jitter in [0.85, 1.15] range', () => {
      const samples = Array.from({ length: 50 }, () => computeBackoff(2, null));
      // attempt 2: base 500 * 2^2 = 2000, jitter 0.85-1.15 → 1700-2300
      for (const delay of samples) {
        expect(delay).toBeGreaterThanOrEqual(1700);
        expect(delay).toBeLessThanOrEqual(2300);
      }
    });

    it('doubles base delay per attempt', () => {
      const a0 = computeBackoff(0, null);
      const a1 = computeBackoff(1, null);
      const a2 = computeBackoff(2, null);
      // a0 ≈ 500, a1 ≈ 1000, a2 ≈ 2000 (with ±15% jitter)
      expect(a0).toBeLessThan(a1);
      expect(a1).toBeLessThan(a2);
    });

    it('honors Retry-After header in seconds', () => {
      const response = new Response(null, { status: 503, headers: { 'Retry-After': '5' } });
      expect(computeBackoff(0, response)).toBe(5000);
    });

    it('caps Retry-After at MAX_RETRY_DELAY_MS', () => {
      const response = new Response(null, { status: 503, headers: { 'Retry-After': '120' } });
      expect(computeBackoff(0, response)).toBeLessThanOrEqual(30000);
    });

    it('falls back to exponential backoff when Retry-After is invalid', () => {
      const response = new Response(null, { status: 503, headers: { 'Retry-After': 'garbage' } });
      const delay = computeBackoff(0, response);
      // Falls back to 500 * 1 (attempt 0) with jitter → 425-575
      expect(delay).toBeGreaterThanOrEqual(425);
      expect(delay).toBeLessThanOrEqual(575);
    });
  });
});

describe('apiClient.get retry behavior', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    localStorage.clear();
    fetchSpy = vi.spyOn(globalThis, 'fetch');
  });

  afterEach(() => {
    fetchSpy.mockRestore();
    vi.useRealTimers();
  });

  it('returns immediately on first success without retrying', async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const result = await apiClient.get<{ ok: boolean }>('/api/test');
    expect(result.ok).toBe(true);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('retries on 503 and succeeds on second attempt', async () => {
    vi.useFakeTimers();
    fetchSpy
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

    const promise = apiClient.get<{ ok: boolean }>('/api/test');
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result.ok).toBe(true);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it('does not retry on 404 (non-retryable 4xx)', async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'Not found' }), { status: 404 })
    );

    await expect(apiClient.get('/api/missing')).rejects.toMatchObject({ message: 'Not found' });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('does not retry on 401 (handled by refresh flow, not retry)', async () => {
    // 401 triggers refresh flow, not the retry loop. With no refresh token available
    // the refresh flow throws; the request is not retried.
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 })
    );

    await expect(apiClient.get('/api/protected')).rejects.toBeDefined();
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('retries on 429 and honors Retry-After', async () => {
    vi.useFakeTimers();
    fetchSpy
      .mockResolvedValueOnce(
        new Response(null, { status: 429, headers: { 'Retry-After': '2' } })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

    const promise = apiClient.get<{ ok: boolean }>('/api/throttled');
    await vi.advanceTimersByTimeAsync(2500);
    const result = await promise;

    expect(result.ok).toBe(true);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it('exhausts retries on persistent 503 and throws the last response error', async () => {
    vi.useFakeTimers();
    fetchSpy.mockResolvedValue(new Response(null, { status: 503 }));

    const promise = apiClient.get('/api/down').catch((e) => e);
    await vi.runAllTimersAsync();
    const error = await promise;

    // 1 initial attempt + MAX_RETRIES retries
    expect(fetchSpy).toHaveBeenCalledTimes(1 + MAX_RETRIES);
    expect(error).toMatchObject({ status_code: 503 });
  });

  it('retries on network error (TypeError) and succeeds', async () => {
    vi.useFakeTimers();
    fetchSpy
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

    const promise = apiClient.get<{ ok: boolean }>('/api/test');
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result.ok).toBe(true);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it('exhausts retries on persistent network error and throws', async () => {
    vi.useFakeTimers();
    fetchSpy.mockRejectedValue(new TypeError('Network down'));

    const promise = apiClient.get('/api/down').catch((e) => e);
    await vi.runAllTimersAsync();
    const error = await promise;

    expect(fetchSpy).toHaveBeenCalledTimes(1 + MAX_RETRIES);
    expect((error as Error).message).toContain('Network error');
  });
});

describe('apiClient non-idempotent methods (POST/PUT/DELETE)', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    localStorage.clear();
    fetchSpy = vi.spyOn(globalThis, 'fetch');
  });

  afterEach(() => {
    fetchSpy.mockRestore();
    vi.useRealTimers();
  });

  it('POST does NOT retry on 503 by default (avoids duplicate side effects)', async () => {
    fetchSpy.mockResolvedValue(new Response(null, { status: 503 }));

    const promise = apiClient.post('/api/alertas', { tipo: 'ACADEMICA' }).catch((e) => e);
    // No fake timers needed: POST must fail fast on first attempt.
    const error = await promise;

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(error).toMatchObject({ status_code: 503 });
  });

  it('POST does NOT retry on network error by default', async () => {
    fetchSpy.mockRejectedValue(new TypeError('Failed to fetch'));

    const promise = apiClient.post('/api/alertas', {}).catch((e) => e);
    const error = await promise;

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect((error as Error).message).toContain('Network error');
  });

  it('POST retries when retry.enabled=true is explicitly passed', async () => {
    vi.useFakeTimers();
    fetchSpy
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 'a1' }), {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        })
      );

    const promise = apiClient.post<{ id: string }>(
      '/api/idempotent',
      { payload: 'x' },
      { enabled: true }
    );
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result.id).toBe('a1');
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it('POST with explicit maxRetries=1 uses that cap, not the default', async () => {
    vi.useFakeTimers();
    fetchSpy.mockResolvedValue(new Response(null, { status: 503 }));

    const promise = apiClient.post('/api/x', {}, { enabled: true, maxRetries: 1 }).catch((e) => e);
    await vi.runAllTimersAsync();
    await promise;

    // 1 initial + 1 retry = 2 calls
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it('PUT does NOT retry on 503 by default', async () => {
    fetchSpy.mockResolvedValue(new Response(null, { status: 503 }));

    const promise = apiClient.put('/api/recurso/1', { name: 'x' }).catch((e) => e);
    const error = await promise;

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(error).toMatchObject({ status_code: 503 });
  });

  it('PUT retries when retry.enabled=true is explicitly passed', async () => {
    vi.useFakeTimers();
    fetchSpy
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

    const promise = apiClient.put<{ ok: boolean }>('/api/x/1', { name: 'x' }, { enabled: true });
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result.ok).toBe(true);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it('DELETE does NOT retry on 503 by default', async () => {
    fetchSpy.mockResolvedValue(new Response(null, { status: 503 }));

    const promise = apiClient.delete('/api/recurso/1').catch((e) => e);
    const error = await promise;

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(error).toMatchObject({ status_code: 503 });
  });

  it('DELETE retries when retry.enabled=true is explicitly passed', async () => {
    vi.useFakeTimers();
    fetchSpy
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));

    const promise = apiClient.delete('/api/x/1', { enabled: true });
    await vi.runAllTimersAsync();
    await promise;

    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it('upload() never retries (POST + file body would duplicate server-side)', async () => {
    fetchSpy.mockResolvedValue(new Response(null, { status: 503 }));

    const file = new File(['content'], 'test.csv', { type: 'text/csv' });
    const promise = apiClient.upload('/api/carga', file).catch((e) => e);
    const error = await promise;

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(error).toMatchObject({ status_code: 503 });
  });
});
