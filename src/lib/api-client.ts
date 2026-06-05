import type { ApiError } from './api-client.types';

const BASE_URL = import.meta.env.VITE_API_URL ?? '';
const REQUEST_TIMEOUT_MS = 30000;

const TOKEN_KEY = 'sat_access_token';
const REFRESH_TOKEN_KEY = 'sat_refresh_token';

class ApiClient {
  private baseUrl: string;
  private isRefreshing = false;
  private refreshQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: Error) => void;
  }> = [];

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  private setTokens(access: string, refresh: string): void {
    localStorage.setItem(TOKEN_KEY, access);
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  }

  private clearTokens(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  private buildHeaders(extra?: HeadersInit): Headers {
    const headers = new Headers(extra);
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    const token = this.getAccessToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  private buildUrl(url: string, params?: Record<string, string | number | boolean | undefined>): string {
    const baseUrl = this.baseUrl || window.location.origin;
    const fullUrl = new URL(url, baseUrl);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          fullUrl.searchParams.set(key, String(value));
        }
      });
    }
    return fullUrl.toString();
  }

  private async handleRefresh(): Promise<string> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${this.baseUrl}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    this.setTokens(data.access_token, data.refresh_token ?? refreshToken);
    return data.access_token;
  }

  private async refreshTokenWithQueue(): Promise<string> {
    if (this.isRefreshing) {
      // queue concurrent requests while refresh is in progress
      return new Promise<string>((resolve, reject) => {
        this.refreshQueue.push({ resolve, reject });
      });
    }

    this.isRefreshing = true;

    try {
      const newToken = await this.handleRefresh();
      // resolve all queued requests with the new token
      this.refreshQueue.forEach(({ resolve }) => resolve(newToken));
      this.refreshQueue = [];
      return newToken;
    } catch (error) {
      // reject all queued requests
      this.refreshQueue.forEach(({ reject }) => reject(error as Error));
      this.refreshQueue = [];
      this.clearTokens();
      window.location.href = '/login';
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  private async request<T>(url: string, options: RequestInit): Promise<T> {
    let response: Response;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
    } catch (error) {
      clearTimeout(timeoutId);
      if ((error as Error).name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }
      throw new Error(
        `Network error: ${error instanceof Error ? error.message : 'Unable to reach server'}`
      );
    }

    clearTimeout(timeoutId);

    if (response.status === 401) {
      const token = this.getAccessToken();
      if (!token) {
        const errorData: ApiError = await response.json().catch(() => ({
          message: response.statusText || 'Unauthorized',
          error_code: 'UNAUTHORIZED',
          status_code: 401,
          timestamp: new Date().toISOString(),
        }));
        throw errorData;
      }
      try {
        const newToken = await this.refreshTokenWithQueue();
        // retry original request with new token
        const retryHeaders = new Headers(options.headers);
        retryHeaders.set('Authorization', `Bearer ${newToken}`);
        const retryResponse = await fetch(url, { ...options, headers: retryHeaders });

        if (!retryResponse.ok) {
          const errorData: ApiError = await retryResponse.json().catch(() => ({
            message: 'Request failed after token refresh',
            error_code: 'UNKNOWN',
            status_code: retryResponse.status,
            timestamp: new Date().toISOString(),
          }));
          throw errorData;
        }

        if (retryResponse.status === 204) return undefined as T;
        return retryResponse.json() as Promise<T>;
      } catch (refreshError) {
        if ((refreshError as ApiError).status_code) throw refreshError;
        throw new Error('Session expired. Please log in again.');
      }
    }

    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({
        message: response.statusText || 'Request failed',
        error_code: 'UNKNOWN',
        status_code: response.status,
        timestamp: new Date().toISOString(),
      }));
      throw errorData;
    }

    if (response.status === 204) return undefined as T;
    return response.json() as Promise<T>;
  }

  async get<T>(url: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    const fullUrl = this.buildUrl(url, params);
    const headers = this.buildHeaders();
    return this.request<T>(fullUrl, { method: 'GET', headers });
  }

  async post<T>(url: string, data?: unknown): Promise<T> {
    const fullUrl = this.buildUrl(url);
    const headers = this.buildHeaders();
    return this.request<T>(fullUrl, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(url: string, data?: unknown): Promise<T> {
    const fullUrl = this.buildUrl(url);
    const headers = this.buildHeaders();
    return this.request<T>(fullUrl, {
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete(url: string): Promise<void> {
    const fullUrl = this.buildUrl(url);
    const headers = this.buildHeaders();
    return this.request<void>(fullUrl, { method: 'DELETE', headers });
  }

  async downloadBlob(url: string): Promise<{ blob: Blob; filename: string }> {
    const fullUrl = this.buildUrl(url);
    const headers = new Headers();
    const token = this.getAccessToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);

    let response = await fetch(fullUrl, { method: 'GET', headers });

    if (response.status === 401) {
      const newToken = await this.refreshTokenWithQueue();
      const retryHeaders = new Headers();
      retryHeaders.set('Authorization', `Bearer ${newToken}`);
      response = await fetch(fullUrl, { method: 'GET', headers: retryHeaders });
    }

    if (!response.ok) throw new Error(`Download failed: ${response.status}`);

    const blob = await response.blob();
    const disposition = response.headers.get('Content-Disposition') ?? '';
    const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    const filename = match ? match[1].replace(/['"]/g, '') : url.split('/').pop() ?? 'download';
    return { blob, filename };
  }

  async upload<T>(url: string, file: File, data?: Record<string, string>): Promise<T> {
    const fullUrl = this.buildUrl(url);
    const formData = new FormData();
    formData.append('file', file);
    if (data) {
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    // do not set content-type header; browser sets multipart boundary automatically
    const headers = new Headers();
    const token = this.getAccessToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return this.request<T>(fullUrl, { method: 'POST', headers, body: formData });
  }
}

export const apiClient = new ApiClient();
