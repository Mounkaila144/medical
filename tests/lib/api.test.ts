import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// We need to mock modules before importing the module under test
vi.mock('@/types', () => ({
  UserRole: {
    SUPERADMIN: 'SUPERADMIN',
    CLINIC_ADMIN: 'CLINIC_ADMIN',
    EMPLOYEE: 'EMPLOYEE',
    PRACTITIONER: 'PRACTITIONER',
    ACCOUNTANT: 'ACCOUNTANT',
  },
}));

import { tokenManager, ApiError, handleApiError, apiClient, createQueryString } from '@/lib/api';

// Helper to create a fake JWT token
function createFakeJWT(payload: Record<string, any>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  const signature = 'fake-signature';
  return `${header}.${body}.${signature}`;
}

describe('TokenManager', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getAccessToken()', () => {
    it('returns null when no token is stored', () => {
      expect(tokenManager.getAccessToken()).toBeNull();
    });

    it('returns the stored access token', () => {
      localStorage.setItem('accessToken', 'test-token-123');
      expect(tokenManager.getAccessToken()).toBe('test-token-123');
    });
  });

  describe('getRefreshToken()', () => {
    it('returns null when no refresh token is stored', () => {
      expect(tokenManager.getRefreshToken()).toBeNull();
    });

    it('returns the stored refresh token', () => {
      localStorage.setItem('refreshToken', 'refresh-token-456');
      expect(tokenManager.getRefreshToken()).toBe('refresh-token-456');
    });
  });

  describe('setTokens()', () => {
    it('stores both access and refresh tokens in localStorage', () => {
      tokenManager.setTokens('access-abc', 'refresh-xyz');
      expect(localStorage.getItem('accessToken')).toBe('access-abc');
      expect(localStorage.getItem('refreshToken')).toBe('refresh-xyz');
    });

    it('stores tokenSetAt timestamp', () => {
      const before = Date.now();
      tokenManager.setTokens('access-abc', 'refresh-xyz');
      const after = Date.now();
      const storedTimestamp = Number(localStorage.getItem('tokenSetAt'));
      expect(storedTimestamp).toBeGreaterThanOrEqual(before);
      expect(storedTimestamp).toBeLessThanOrEqual(after);
    });
  });

  describe('clearTokens()', () => {
    it('removes all auth data from localStorage', () => {
      localStorage.setItem('accessToken', 'token');
      localStorage.setItem('refreshToken', 'refresh');
      localStorage.setItem('user', '{"id":"1"}');
      localStorage.setItem('practitioner', '{"id":"2"}');
      localStorage.setItem('tokenSetAt', '12345');

      tokenManager.clearTokens();

      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
      expect(localStorage.getItem('practitioner')).toBeNull();
      expect(localStorage.getItem('tokenSetAt')).toBeNull();
    });
  });

  describe('getUser() / setUser()', () => {
    it('returns null when no user is stored', () => {
      expect(tokenManager.getUser()).toBeNull();
    });

    it('stores and retrieves a user object via JSON serialization', () => {
      const user = { id: '1', email: 'test@test.com', firstName: 'Jean', lastName: 'Dupont', role: 'CLINIC_ADMIN' };
      tokenManager.setUser(user);
      const retrieved = tokenManager.getUser();
      expect(retrieved).toEqual(user);
    });

    it('correctly serializes complex objects', () => {
      const user = { id: '2', nested: { a: 1, b: [1, 2, 3] } };
      tokenManager.setUser(user);
      expect(tokenManager.getUser()).toEqual(user);
    });
  });

  describe('getPractitioner() / setPractitioner()', () => {
    it('returns null when no practitioner is stored', () => {
      expect(tokenManager.getPractitioner()).toBeNull();
    });

    it('stores and retrieves a practitioner object', () => {
      const practitioner = { id: '3', firstName: 'Dr. Sophie', lastName: 'Leroy' };
      tokenManager.setPractitioner(practitioner);
      expect(tokenManager.getPractitioner()).toEqual(practitioner);
    });
  });

  describe('isTokenExpired()', () => {
    it('returns true for an invalid token', () => {
      expect(tokenManager.isTokenExpired('invalid-token')).toBe(true);
    });

    it('returns true when token is expired', () => {
      // Expired 1 hour ago
      const expiredPayload = { exp: Math.floor(Date.now() / 1000) - 3600 };
      const token = createFakeJWT(expiredPayload);
      expect(tokenManager.isTokenExpired(token, 0)).toBe(true);
    });

    it('returns false when token is valid and not close to expiration', () => {
      // Expires in 1 hour
      const validPayload = { exp: Math.floor(Date.now() / 1000) + 3600 };
      const token = createFakeJWT(validPayload);
      expect(tokenManager.isTokenExpired(token, 5)).toBe(false);
    });

    it('returns true when token expires within buffer time', () => {
      // Expires in 3 minutes, buffer is 5 minutes
      const soonPayload = { exp: Math.floor(Date.now() / 1000) + 180 };
      const token = createFakeJWT(soonPayload);
      expect(tokenManager.isTokenExpired(token, 5)).toBe(true);
    });

    it('returns true when token has no exp field', () => {
      const noExpPayload = { sub: 'user-1' };
      const token = createFakeJWT(noExpPayload);
      expect(tokenManager.isTokenExpired(token)).toBe(true);
    });
  });

  describe('decodeToken()', () => {
    it('returns decoded JWT payload', () => {
      const payload = { sub: 'user-123', role: 'ADMIN', exp: 9999999999 };
      const token = createFakeJWT(payload);
      const decoded = tokenManager.decodeToken(token);
      expect(decoded).toEqual(payload);
    });

    it('returns null for an invalid token', () => {
      expect(tokenManager.decodeToken('not-a-jwt')).toBeNull();
    });

    it('returns null for an empty string', () => {
      expect(tokenManager.decodeToken('')).toBeNull();
    });
  });

  describe('getRefreshPromise() / setRefreshPromise()', () => {
    it('returns null initially', () => {
      expect(tokenManager.getRefreshPromise()).toBeNull();
    });

    it('stores and retrieves a promise', () => {
      const promise = Promise.resolve(true);
      tokenManager.setRefreshPromise(promise);
      expect(tokenManager.getRefreshPromise()).toBe(promise);
    });

    it('can be set back to null', () => {
      tokenManager.setRefreshPromise(Promise.resolve(true));
      tokenManager.setRefreshPromise(null);
      expect(tokenManager.getRefreshPromise()).toBeNull();
    });
  });
});

describe('ApiError', () => {
  it('sets status, message, and data properties', () => {
    const error = new ApiError(404, 'Not found', { detail: 'Resource missing' });
    expect(error.status).toBe(404);
    expect(error.message).toBe('Not found');
    expect(error.data).toEqual({ detail: 'Resource missing' });
    expect(error.name).toBe('ApiError');
  });

  it('extends Error', () => {
    const error = new ApiError(500, 'Server error');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ApiError);
  });

  it('data is optional', () => {
    const error = new ApiError(400, 'Bad request');
    expect(error.data).toBeUndefined();
  });
});

describe('handleApiError()', () => {
  it('extracts message from ApiError', () => {
    const error = new ApiError(422, 'Validation failed');
    expect(handleApiError(error)).toBe('Validation failed');
  });

  it('extracts message from regular Error', () => {
    const error = new Error('Something went wrong');
    expect(handleApiError(error)).toBe('Something went wrong');
  });

  it('returns default message for unknown error types', () => {
    expect(handleApiError('string error')).toBe('An unexpected error occurred');
    expect(handleApiError(42)).toBe('An unexpected error occurred');
    expect(handleApiError(null)).toBe('An unexpected error occurred');
    expect(handleApiError(undefined)).toBe('An unexpected error occurred');
  });
});

describe('createQueryString()', () => {
  it('creates query string from params', () => {
    const result = createQueryString({ page: 1, limit: 10 });
    expect(result).toContain('page=1');
    expect(result).toContain('limit=10');
  });

  it('skips undefined, null, and empty string values', () => {
    const result = createQueryString({ a: 'value', b: undefined, c: null, d: '' });
    expect(result).toBe('a=value');
  });

  it('returns empty string for empty params', () => {
    expect(createQueryString({})).toBe('');
  });
});

describe('ApiClient', () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    localStorage.clear();
    fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function mockFetchResponse(body: any, status = 200, headers: Record<string, string> = {}) {
    const headerMap = new Map(Object.entries({
      'content-type': 'application/json',
      ...headers,
    }));
    return fetchSpy.mockResolvedValueOnce({
      ok: status >= 200 && status < 300,
      status,
      statusText: status === 200 ? 'OK' : 'Error',
      headers: {
        get: (key: string) => headerMap.get(key.toLowerCase()) || null,
        entries: () => headerMap.entries(),
      },
      json: () => Promise.resolve(body),
      text: () => Promise.resolve(JSON.stringify(body)),
    });
  }

  describe('get()', () => {
    it('calls fetch with correct URL and GET method', async () => {
      mockFetchResponse({ data: 'test' });
      const result = await apiClient.get('/test-endpoint');
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('/test-endpoint'),
        expect.objectContaining({ method: 'GET' })
      );
      expect(result).toEqual({ data: 'test' });
    });

    it('includes Authorization header when token exists', async () => {
      // Set a token that won't be expired
      const validToken = createFakeJWT({ exp: Math.floor(Date.now() / 1000) + 3600 });
      localStorage.setItem('accessToken', validToken);

      mockFetchResponse({ data: 'secured' });
      await apiClient.get('/secured');

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: expect.stringContaining('Bearer '),
          }),
        })
      );
    });
  });

  describe('post()', () => {
    it('sends JSON body with POST method', async () => {
      mockFetchResponse({ id: '1', name: 'test' });
      const body = { name: 'test', value: 42 };
      const result = await apiClient.post('/create', body);

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('/create'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(body),
        })
      );
      expect(result).toEqual({ id: '1', name: 'test' });
    });

    it('sends POST without body when data is undefined', async () => {
      mockFetchResponse({ success: true });
      await apiClient.post('/action');

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: undefined,
        })
      );
    });
  });

  describe('put()', () => {
    it('sends PUT request with JSON body', async () => {
      mockFetchResponse({ updated: true });
      const body = { name: 'updated' };
      await apiClient.put('/update/1', body);

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('/update/1'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(body),
        })
      );
    });
  });

  describe('patch()', () => {
    it('sends PATCH request with JSON body', async () => {
      mockFetchResponse({ patched: true });
      await apiClient.patch('/patch/1', { field: 'value' });

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('/patch/1'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ field: 'value' }),
        })
      );
    });
  });

  describe('delete()', () => {
    it('uses DELETE method', async () => {
      mockFetchResponse(null, 204, { 'content-length': '0' });
      await apiClient.delete('/delete/1');

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('/delete/1'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('401 response handling', () => {
    it('attempts token refresh on 401 and retries request', async () => {
      // Set a valid (non-expired) token so proactive refresh is not triggered
      const validToken = createFakeJWT({ exp: Math.floor(Date.now() / 1000) + 3600 });
      localStorage.setItem('accessToken', validToken);
      localStorage.setItem('refreshToken', 'valid-refresh-token');

      const headerMap = new Map([['content-type', 'application/json']]);
      const makeHeaders = () => ({
        get: (key: string) => headerMap.get(key.toLowerCase()) || null,
        entries: () => headerMap.entries(),
      });

      // First call: 401
      fetchSpy.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        headers: makeHeaders(),
        json: () => Promise.resolve({ message: 'Token expired' }),
        text: () => Promise.resolve(JSON.stringify({ message: 'Token expired' })),
      });

      // Refresh call: success
      const newToken = createFakeJWT({ exp: Math.floor(Date.now() / 1000) + 7200 });
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: makeHeaders(),
        json: () => Promise.resolve({ accessToken: newToken, refreshToken: 'new-refresh' }),
        text: () => Promise.resolve(JSON.stringify({ accessToken: newToken, refreshToken: 'new-refresh' })),
      });

      // Retry call: success
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: makeHeaders(),
        json: () => Promise.resolve({ data: 'retried-success' }),
        text: () => Promise.resolve(JSON.stringify({ data: 'retried-success' })),
      });

      const result = await apiClient.get('/protected');
      expect(result).toEqual({ data: 'retried-success' });
      expect(fetchSpy).toHaveBeenCalledTimes(3);
    });
  });

  describe('error handling', () => {
    it('throws ApiError for non-OK responses', async () => {
      const headerMap = new Map([['content-type', 'application/json']]);
      fetchSpy.mockResolvedValueOnce({
        ok: false,
        status: 422,
        statusText: 'Unprocessable Entity',
        headers: {
          get: (key: string) => headerMap.get(key.toLowerCase()) || null,
          entries: () => headerMap.entries(),
        },
        json: () => Promise.resolve({ message: 'Validation error' }),
        text: () => Promise.resolve(JSON.stringify({ message: 'Validation error' })),
      });

      await expect(apiClient.get('/bad-request')).rejects.toThrow(ApiError);
    });

    it('throws ApiError with 500 status for network errors', async () => {
      fetchSpy.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(apiClient.get('/unreachable')).rejects.toThrow('Network error occurred');
    });
  });
});
