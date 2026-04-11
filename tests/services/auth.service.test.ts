import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock apiClient and tokenManager before importing the service
const mockPost = vi.fn();
const mockGet = vi.fn();
const mockGetAccessToken = vi.fn();
const mockGetRefreshToken = vi.fn();
const mockSetTokens = vi.fn();
const mockClearTokens = vi.fn();
const mockSetUser = vi.fn();
const mockGetUser = vi.fn();
const mockSetPractitioner = vi.fn();
const mockGetPractitioner = vi.fn();

vi.mock('@/lib/api', () => ({
  apiClient: {
    post: (...args: any[]) => mockPost(...args),
    get: (...args: any[]) => mockGet(...args),
  },
  tokenManager: {
    getAccessToken: () => mockGetAccessToken(),
    getRefreshToken: () => mockGetRefreshToken(),
    setTokens: (...args: any[]) => mockSetTokens(...args),
    clearTokens: () => mockClearTokens(),
    setUser: (...args: any[]) => mockSetUser(...args),
    getUser: () => mockGetUser(),
    setPractitioner: (...args: any[]) => mockSetPractitioner(...args),
    getPractitioner: () => mockGetPractitioner(),
  },
}));

vi.mock('@/types', () => ({
  UserRole: {
    SUPERADMIN: 'SUPERADMIN',
    CLINIC_ADMIN: 'CLINIC_ADMIN',
    EMPLOYEE: 'EMPLOYEE',
    PRACTITIONER: 'PRACTITIONER',
    ACCOUNTANT: 'ACCOUNTANT',
  },
}));

import { AuthService } from '@/services/auth.service';

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login()', () => {
    it('calls POST /auth/login and stores tokens and user', async () => {
      const mockResponse = {
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456',
        user: { id: '1', email: 'admin@test.com', role: 'CLINIC_ADMIN' },
        userType: 'user' as const,
      };
      mockPost.mockResolvedValueOnce(mockResponse);

      const result = await AuthService.login({ email: 'admin@test.com', password: 'password123' });

      expect(mockClearTokens).toHaveBeenCalled();
      expect(mockPost).toHaveBeenCalledWith('/auth/login', { email: 'admin@test.com', password: 'password123' });
      expect(mockSetTokens).toHaveBeenCalledWith('access-token-123', 'refresh-token-456');
      expect(mockSetUser).toHaveBeenCalledWith(mockResponse.user);
      expect(result).toEqual(mockResponse);
    });

    it('stores practitioner when response contains practitioner', async () => {
      const mockResponse = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        practitioner: { id: '2', firstName: 'Dr. Sophie', lastName: 'Leroy' },
        userType: 'practitioner' as const,
      };
      mockPost.mockResolvedValueOnce(mockResponse);

      await AuthService.login({ email: 'doctor@test.com', password: 'password' });

      expect(mockSetPractitioner).toHaveBeenCalledWith(mockResponse.practitioner);
    });
  });

  describe('loginUser()', () => {
    it('calls POST /auth/login with correct body', async () => {
      const mockResponse = {
        accessToken: 'user-access-token',
        refreshToken: 'user-refresh-token',
        user: { id: '1', email: 'user@test.com', role: 'EMPLOYEE' },
      };
      mockPost.mockResolvedValueOnce(mockResponse);

      const credentials = { email: 'user@test.com', password: 'pass123' };
      const result = await AuthService.loginUser(credentials);

      expect(mockClearTokens).toHaveBeenCalled();
      expect(mockPost).toHaveBeenCalledWith('/auth/login', credentials);
      expect(mockSetTokens).toHaveBeenCalledWith('user-access-token', 'user-refresh-token');
      expect(mockSetUser).toHaveBeenCalledWith(mockResponse.user);
      expect(result).toEqual(mockResponse);
    });

    it('does not store user when response has no user', async () => {
      const mockResponse = {
        accessToken: 'token',
        refreshToken: 'refresh',
      };
      mockPost.mockResolvedValueOnce(mockResponse);

      await AuthService.loginUser({ email: 'test@test.com', password: 'pass' });

      expect(mockSetUser).not.toHaveBeenCalled();
    });
  });

  describe('loginPractitioner()', () => {
    it('calls POST /auth/practitioner/login', async () => {
      const mockResponse = {
        accessToken: 'pract-access-token',
        refreshToken: 'pract-refresh-token',
        practitioner: { id: '3', firstName: 'Dr. Thomas', lastName: 'Moreau' },
      };
      mockPost.mockResolvedValueOnce(mockResponse);

      const credentials = { email: 'doctor@clinic.com', password: 'pass' };
      const result = await AuthService.loginPractitioner(credentials);

      expect(mockClearTokens).toHaveBeenCalled();
      expect(mockPost).toHaveBeenCalledWith('/auth/practitioner/login', credentials);
      expect(mockSetTokens).toHaveBeenCalledWith('pract-access-token', 'pract-refresh-token');
      expect(mockSetPractitioner).toHaveBeenCalledWith(mockResponse.practitioner);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('logout()', () => {
    it('calls POST /auth/logout with refreshToken and clears tokens', async () => {
      mockGetRefreshToken.mockReturnValueOnce('refresh-token-to-invalidate');
      mockPost.mockResolvedValueOnce(undefined);

      await AuthService.logout();

      expect(mockPost).toHaveBeenCalledWith('/auth/logout', { refreshToken: 'refresh-token-to-invalidate' });
      expect(mockClearTokens).toHaveBeenCalled();
    });

    it('clears tokens even if API call fails', async () => {
      mockGetRefreshToken.mockReturnValueOnce('refresh-token');
      mockPost.mockRejectedValueOnce(new Error('Network error'));

      await AuthService.logout();

      expect(mockClearTokens).toHaveBeenCalled();
    });

    it('clears tokens when no refresh token exists', async () => {
      mockGetRefreshToken.mockReturnValueOnce(null);

      await AuthService.logout();

      expect(mockPost).not.toHaveBeenCalled();
      expect(mockClearTokens).toHaveBeenCalled();
    });
  });

  describe('logoutPractitioner()', () => {
    it('calls POST /auth/practitioner/logout', async () => {
      mockGetRefreshToken.mockReturnValueOnce('pract-refresh');
      mockPost.mockResolvedValueOnce(undefined);

      await AuthService.logoutPractitioner();

      expect(mockPost).toHaveBeenCalledWith('/auth/practitioner/logout', { refreshToken: 'pract-refresh' });
      expect(mockClearTokens).toHaveBeenCalled();
    });
  });

  describe('isAuthenticated()', () => {
    it('returns true when token exists', () => {
      mockGetAccessToken.mockReturnValueOnce('some-token');
      expect(AuthService.isAuthenticated()).toBe(true);
    });

    it('returns false when no token exists', () => {
      mockGetAccessToken.mockReturnValueOnce(null);
      expect(AuthService.isAuthenticated()).toBe(false);
    });
  });

  describe('hasRole()', () => {
    it('returns true when user role matches', () => {
      mockGetUser.mockReturnValueOnce({ role: 'SUPERADMIN' });
      mockGetPractitioner.mockReturnValueOnce(null);
      expect(AuthService.hasRole('SUPERADMIN')).toBe(true);
    });

    it('returns false when user role does not match', () => {
      mockGetUser.mockReturnValueOnce({ role: 'EMPLOYEE' });
      mockGetPractitioner.mockReturnValueOnce(null);
      expect(AuthService.hasRole('SUPERADMIN')).toBe(false);
    });

    it('returns true for PRACTITIONER role when practitioner exists', () => {
      mockGetUser.mockReturnValueOnce(null);
      mockGetPractitioner.mockReturnValueOnce({ id: '1', firstName: 'Dr.', lastName: 'Test' });
      expect(AuthService.hasRole('PRACTITIONER')).toBe(true);
    });

    it('returns false when no user and no practitioner', () => {
      mockGetUser.mockReturnValueOnce(null);
      mockGetPractitioner.mockReturnValueOnce(null);
      expect(AuthService.hasRole('SUPERADMIN')).toBe(false);
    });
  });

  describe('hasAnyRole()', () => {
    it('returns true when any role matches', () => {
      mockGetUser.mockReturnValue({ role: 'CLINIC_ADMIN' });
      mockGetPractitioner.mockReturnValue(null);
      expect(AuthService.hasAnyRole(['SUPERADMIN', 'CLINIC_ADMIN'])).toBe(true);
    });

    it('returns false when no role matches', () => {
      mockGetUser.mockReturnValue({ role: 'EMPLOYEE' });
      mockGetPractitioner.mockReturnValue(null);
      expect(AuthService.hasAnyRole(['SUPERADMIN', 'CLINIC_ADMIN'])).toBe(false);
    });
  });

  describe('getCurrentUser()', () => {
    it('returns user from tokenManager', () => {
      const user = { id: '1', email: 'test@test.com', role: 'EMPLOYEE' };
      mockGetUser.mockReturnValueOnce(user);
      expect(AuthService.getCurrentUser()).toEqual(user);
    });

    it('returns null when no user stored', () => {
      mockGetUser.mockReturnValueOnce(null);
      expect(AuthService.getCurrentUser()).toBeNull();
    });
  });

  describe('getCurrentPractitioner()', () => {
    it('returns practitioner from tokenManager', () => {
      const practitioner = { id: '2', firstName: 'Dr. Sophie', lastName: 'Leroy' };
      mockGetPractitioner.mockReturnValueOnce(practitioner);
      expect(AuthService.getCurrentPractitioner()).toEqual(practitioner);
    });
  });

  describe('getPractitionerProfile()', () => {
    it('calls GET /auth/practitioner/profile', async () => {
      const profile = { id: '2', firstName: 'Sophie', lastName: 'Leroy', speciality: 'CARDIOLOGY' };
      mockGet.mockResolvedValueOnce(profile);

      const result = await AuthService.getPractitionerProfile();

      expect(mockGet).toHaveBeenCalledWith('/auth/practitioner/profile');
      expect(result).toEqual(profile);
    });
  });
});
