import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
  }),
}));

// Mock AuthService
const mockLogin = vi.fn();
const mockLoginUser = vi.fn();
const mockLoginPractitioner = vi.fn();
const mockLogout = vi.fn();
const mockLogoutPractitioner = vi.fn();
const mockHasRoleService = vi.fn();
const mockHasAnyRoleService = vi.fn();
const mockGetCurrentUser = vi.fn();
const mockGetCurrentPractitioner = vi.fn();

vi.mock('@/services/auth.service', () => ({
  AuthService: {
    login: (...args: any[]) => mockLogin(...args),
    loginUser: (...args: any[]) => mockLoginUser(...args),
    loginPractitioner: (...args: any[]) => mockLoginPractitioner(...args),
    logout: () => mockLogout(),
    logoutPractitioner: () => mockLogoutPractitioner(),
    hasRole: (role: string) => mockHasRoleService(role),
    hasAnyRole: (roles: string[]) => mockHasAnyRoleService(roles),
    getCurrentUser: () => mockGetCurrentUser(),
    getCurrentPractitioner: () => mockGetCurrentPractitioner(),
  },
}));

// Mock tokenManager
const mockGetAccessToken = vi.fn();
const mockGetUserTM = vi.fn();
const mockGetPractitionerTM = vi.fn();

vi.mock('@/lib/api', () => ({
  tokenManager: {
    getAccessToken: () => mockGetAccessToken(),
    getUser: () => mockGetUserTM(),
    getPractitioner: () => mockGetPractitionerTM(),
    clearTokens: vi.fn(),
    isTokenExpired: vi.fn().mockReturnValue(false),
    decodeToken: vi.fn().mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 }),
    getRefreshToken: vi.fn().mockReturnValue(null),
    setTokens: vi.fn(),
  },
  handleApiError: (error: any) => {
    if (error instanceof Error) return error.message;
    return 'An unexpected error occurred';
  },
}));

// Mock useTokenRefresh
vi.mock('@/hooks/useTokenRefresh', () => ({
  useTokenRefresh: () => {},
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

// Import AFTER mocks
import { useAuth } from '@/hooks/useAuth';

describe('useAuth hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAccessToken.mockReturnValue(null);
    mockGetUserTM.mockReturnValue(null);
    mockGetPractitionerTM.mockReturnValue(null);
  });

  describe('initial state', () => {
    it('resolves to isLoading=false after initialization with no token', async () => {
      const { result } = renderHook(() => useAuth());
      // In jsdom, effects run synchronously, so by the time we read,
      // initialization has completed and isLoading becomes false
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('starts with user=null', () => {
      const { result } = renderHook(() => useAuth());
      expect(result.current.user).toBeNull();
    });

    it('starts with practitioner=null', () => {
      const { result } = renderHook(() => useAuth());
      expect(result.current.practitioner).toBeNull();
    });

    it('starts with isAuthenticated=false', () => {
      const { result } = renderHook(() => useAuth());
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('after mount with token in localStorage', () => {
    it('loads user from tokenManager when token exists', async () => {
      const storedUser = { id: '1', email: 'admin@test.com', role: 'CLINIC_ADMIN', firstName: 'Admin', lastName: 'Test' };
      mockGetAccessToken.mockReturnValue('valid-token');
      mockGetUserTM.mockReturnValue(storedUser);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toEqual(storedUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('loads practitioner from tokenManager when practitioner data exists', async () => {
      const storedPractitioner = { id: '2', firstName: 'Dr. Sophie', lastName: 'Leroy' };
      mockGetAccessToken.mockReturnValue('valid-token');
      mockGetPractitionerTM.mockReturnValue(storedPractitioner);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.practitioner).toEqual(storedPractitioner);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('sets isAuthenticated=false when no token exists', async () => {
      mockGetAccessToken.mockReturnValue(null);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });
  });

  describe('login()', () => {
    it('calls AuthService.login and redirects SUPERADMIN to /admin/dashboard', async () => {
      const response = {
        accessToken: 'token',
        refreshToken: 'refresh',
        user: { id: '1', role: 'SUPERADMIN', firstName: 'Super', lastName: 'Admin' },
        userType: 'user' as const,
      };
      mockLogin.mockResolvedValueOnce(response);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.login({ email: 'admin@test.com', password: 'pass' });
      });

      expect(mockLogin).toHaveBeenCalledWith({ email: 'admin@test.com', password: 'pass' });
      expect(mockPush).toHaveBeenCalledWith('/admin/dashboard');
    });

    it('redirects ACCOUNTANT to /accounting/dashboard', async () => {
      const response = {
        accessToken: 'token',
        refreshToken: 'refresh',
        user: { id: '2', role: 'ACCOUNTANT', firstName: 'Acc', lastName: 'Test' },
        userType: 'user' as const,
      };
      mockLogin.mockResolvedValueOnce(response);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.login({ email: 'accountant@test.com', password: 'pass' });
      });

      expect(mockPush).toHaveBeenCalledWith('/accounting/dashboard');
    });

    it('redirects PRACTITIONER to /practitioner/dashboard', async () => {
      const response = {
        accessToken: 'token',
        refreshToken: 'refresh',
        practitioner: { id: '3', firstName: 'Dr. Sophie', lastName: 'Leroy' },
        userType: 'practitioner' as const,
      };
      mockLogin.mockResolvedValueOnce(response);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.login({ email: 'doctor@test.com', password: 'pass' });
      });

      expect(mockPush).toHaveBeenCalledWith('/practitioner/dashboard');
    });

    it('redirects CLINIC_ADMIN and EMPLOYEE to /dashboard', async () => {
      const response = {
        accessToken: 'token',
        refreshToken: 'refresh',
        user: { id: '4', role: 'CLINIC_ADMIN', firstName: 'Clinic', lastName: 'Admin' },
        userType: 'user' as const,
      };
      mockLogin.mockResolvedValueOnce(response);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.login({ email: 'clinic@test.com', password: 'pass' });
      });

      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });

    it('rejects with error on login failure', async () => {
      const loginError = new Error('Invalid credentials');
      mockLogin.mockRejectedValueOnce(loginError);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verify login throws the error
      let thrownError: Error | null = null;
      try {
        await act(async () => {
          await result.current.login({ email: 'bad@test.com', password: 'wrong' });
        });
      } catch (err: any) {
        thrownError = err;
      }

      expect(thrownError).toBe(loginError);
      expect(thrownError!.message).toBe('Invalid credentials');
      // After error, isLoading should be false
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('loginUser()', () => {
    it('calls AuthService.loginUser and redirects to /dashboard', async () => {
      const response = {
        accessToken: 'token',
        refreshToken: 'refresh',
        user: { id: '5', role: 'EMPLOYEE', firstName: 'Emp', lastName: 'Test' },
      };
      mockLoginUser.mockResolvedValueOnce(response);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.loginUser({ email: 'employee@test.com', password: 'pass' });
      });

      expect(mockLoginUser).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  describe('loginPractitioner()', () => {
    it('calls AuthService.loginPractitioner and redirects to /practitioner/dashboard', async () => {
      const response = {
        accessToken: 'token',
        refreshToken: 'refresh',
        practitioner: { id: '6', firstName: 'Dr. Claire', lastName: 'Dubois' },
      };
      mockLoginPractitioner.mockResolvedValueOnce(response);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.loginPractitioner({ email: 'doctor@test.com', password: 'pass' });
      });

      expect(mockLoginPractitioner).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/practitioner/dashboard');
    });
  });

  describe('logout()', () => {
    it('clears state and redirects to /auth/login', async () => {
      mockLogout.mockResolvedValueOnce(undefined);
      mockGetAccessToken.mockReturnValue('valid-token');
      mockGetUserTM.mockReturnValue({ id: '1', role: 'EMPLOYEE' });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(mockPush).toHaveBeenCalledWith('/auth/login');
    });

    it('redirects to /auth/login even if logout API fails', async () => {
      mockLogout.mockRejectedValueOnce(new Error('Network error'));
      mockGetAccessToken.mockReturnValue('valid-token');
      mockGetUserTM.mockReturnValue({ id: '1', role: 'EMPLOYEE' });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(mockPush).toHaveBeenCalledWith('/auth/login');
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('hasRole()', () => {
    it('delegates to AuthService.hasRole', async () => {
      mockHasRoleService.mockReturnValue(true);

      const { result } = renderHook(() => useAuth());

      const hasRole = result.current.hasRole('SUPERADMIN');

      expect(mockHasRoleService).toHaveBeenCalledWith('SUPERADMIN');
      expect(hasRole).toBe(true);
    });

    it('returns false when role does not match', () => {
      mockHasRoleService.mockReturnValue(false);

      const { result } = renderHook(() => useAuth());

      expect(result.current.hasRole('SUPERADMIN')).toBe(false);
    });
  });

  describe('hasAnyRole()', () => {
    it('delegates to AuthService.hasAnyRole', () => {
      mockHasAnyRoleService.mockReturnValue(true);

      const { result } = renderHook(() => useAuth());

      expect(result.current.hasAnyRole(['SUPERADMIN', 'CLINIC_ADMIN'])).toBe(true);
      expect(mockHasAnyRoleService).toHaveBeenCalledWith(['SUPERADMIN', 'CLINIC_ADMIN']);
    });
  });

  describe('getUserType()', () => {
    it('returns "practitioner" for PRACTITIONER role user', async () => {
      mockGetAccessToken.mockReturnValue('token');
      mockGetUserTM.mockReturnValue({ id: '1', role: 'PRACTITIONER', firstName: 'P', lastName: 'T' });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.getUserType()).toBe('practitioner');
    });

    it('returns "practitioner" when practitioner object exists', async () => {
      mockGetAccessToken.mockReturnValue('token');
      mockGetPractitionerTM.mockReturnValue({ id: '2', firstName: 'Dr.', lastName: 'Test' });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.getUserType()).toBe('practitioner');
    });

    it('returns "user" for regular user roles', async () => {
      mockGetAccessToken.mockReturnValue('token');
      mockGetUserTM.mockReturnValue({ id: '3', role: 'EMPLOYEE', firstName: 'E', lastName: 'T' });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.getUserType()).toBe('user');
    });

    it('returns null when no user or practitioner', async () => {
      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.getUserType()).toBeNull();
    });
  });

  describe('getDisplayName()', () => {
    it('returns full name for user', async () => {
      mockGetAccessToken.mockReturnValue('token');
      mockGetUserTM.mockReturnValue({ id: '1', role: 'EMPLOYEE', firstName: 'Jean', lastName: 'Dupont' });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.getDisplayName()).toBe('Jean Dupont');
    });

    it('returns "Dr." prefix for practitioner', async () => {
      mockGetAccessToken.mockReturnValue('token');
      mockGetPractitionerTM.mockReturnValue({ id: '2', firstName: 'Sophie', lastName: 'Leroy' });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.getDisplayName()).toBe('Dr. Sophie Leroy');
    });

    it('returns empty string when no user or practitioner', async () => {
      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.getDisplayName()).toBe('');
    });
  });

  describe('clearError()', () => {
    it('clears error state from null to null (no-op when no error)', async () => {
      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Error starts as null
      expect(result.current.error).toBeNull();

      // clearError should be safe to call even with no error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });

    it('clearError function exists and is callable', async () => {
      const { result } = renderHook(() => useAuth());

      expect(typeof result.current.clearError).toBe('function');
    });
  });

  describe('checkAuth()', () => {
    it('returns true when token exists', () => {
      mockGetAccessToken.mockReturnValue('some-token');

      const { result } = renderHook(() => useAuth());

      expect(result.current.checkAuth()).toBe(true);
    });

    it('returns false when no token', () => {
      mockGetAccessToken.mockReturnValue(null);

      const { result } = renderHook(() => useAuth());

      expect(result.current.checkAuth()).toBe(false);
    });
  });
});
