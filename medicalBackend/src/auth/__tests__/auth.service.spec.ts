import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../services/auth.service';
import { UsersService } from '../services/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, AuthUserRole } from '../entities/user.entity';
import { Session } from '../entities/session.entity';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUserRepository = {
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockSessionRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockImplementation((key) => {
      if (key === 'JWT_ACCESS_SECRET') return 'test-access-secret';
      if (key === 'JWT_REFRESH_SECRET') return 'test-refresh-secret';
      return null;
    }),
  };

  const mockJwtService = {
    sign: jest.fn().mockImplementation(() => 'signed-token'),
    verify: jest.fn(),
  };

  const mockUsersService = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Session),
          useValue: mockSessionRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user when credentials are valid', async () => {
      const testUser = {
        id: 'test-id',
        email: 'test@example.com',
        passwordHash: await bcrypt.hash('password123', 10),
        role: AuthUserRole.SUPERADMIN,
        isActive: true,
      };
      mockUserRepository.findOne.mockResolvedValue(testUser);

      const result = await service.validateUser('test@example.com', 'password123');

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(mockUserRepository.update).toHaveBeenCalledWith('test-id', { lastLogin: expect.any(Date) });
      expect(result).toEqual({
        id: 'test-id',
        email: 'test@example.com',
        role: AuthUserRole.SUPERADMIN,
        isActive: true,
      });
    });

    it('should return null when user is not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.validateUser('nonexistent@example.com', 'password123');

      expect(result).toBeNull();
    });

    it('should throw UnauthorizedException when user is not active', async () => {
      const testUser = {
        id: 'test-id',
        email: 'test@example.com',
        passwordHash: await bcrypt.hash('password123', 10),
        role: AuthUserRole.SUPERADMIN,
        isActive: false,
      };
      mockUserRepository.findOne.mockResolvedValue(testUser);

      await expect(service.validateUser('test@example.com', 'password123')).rejects.toThrow(UnauthorizedException);
    });

    it('should return null when password is incorrect', async () => {
      const testUser = {
        id: 'test-id',
        email: 'test@example.com',
        passwordHash: await bcrypt.hash('password123', 10),
        role: AuthUserRole.SUPERADMIN,
        isActive: true,
      };
      mockUserRepository.findOne.mockResolvedValue(testUser);

      const result = await service.validateUser('test@example.com', 'wrongpassword');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should generate tokens and create a session', async () => {
      const user = {
        id: 'user-id',
        email: 'user@example.com',
        role: AuthUserRole.SUPERADMIN,
        firstName: 'Test',
        lastName: 'User',
      };

      const result = await service.login(user);

      expect(mockJwtService.sign).toHaveBeenCalledTimes(2);
      expect(mockSessionRepository.save).toHaveBeenCalledWith({
        userId: 'user-id',
        refreshTokenHash: expect.any(String),
        expiresAt: expect.any(Date),
      });
      expect(result).toEqual({
        accessToken: 'signed-token',
        refreshToken: 'signed-token',
        user: {
          id: 'user-id',
          email: 'user@example.com',
          role: AuthUserRole.SUPERADMIN,
          firstName: 'Test',
          lastName: 'User',
        },
      });
    });
  });

  describe('refresh', () => {
    it('should refresh tokens when refresh token is valid', async () => {
      // Mock validateRefreshToken to return true
      jest.spyOn(service, 'validateRefreshToken').mockResolvedValue(true);
      
      // Mock user service to return a user
      const mockUser = {
        id: 'user-id',
        email: 'user@example.com',
        role: AuthUserRole.SUPERADMIN,
        firstName: 'Test',
        lastName: 'User',
      };
      mockUsersService.findById.mockResolvedValue(mockUser);

      const result = await service.refresh('user-id', 'valid-refresh-token');

      expect(service.validateRefreshToken).toHaveBeenCalledWith('user-id', 'valid-refresh-token');
      expect(mockUsersService.findById).toHaveBeenCalledWith('user-id');
      expect(result).toEqual({
        accessToken: 'signed-token',
        refreshToken: 'signed-token',
        user: {
          id: 'user-id',
          email: 'user@example.com',
          role: AuthUserRole.SUPERADMIN,
          firstName: 'Test',
          lastName: 'User',
        },
      });
    });

    it('should throw UnauthorizedException when refresh token is invalid', async () => {
      // Mock validateRefreshToken to return false
      jest.spyOn(service, 'validateRefreshToken').mockResolvedValue(false);

      await expect(service.refresh('user-id', 'invalid-refresh-token')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should remove session when refresh token is found', async () => {
      const mockSessions = [
        { id: 'session-id-1' },
        { id: 'session-id-2' },
      ];
      mockSessionRepository.find.mockResolvedValue(mockSessions);

      const result = await service.logout('user-id', 'refresh-token');

      expect(mockSessionRepository.remove).toHaveBeenCalledWith(mockSessions[0]);
      expect(mockSessionRepository.remove).toHaveBeenCalledWith(mockSessions[1]);
      expect(result).toEqual({ success: true, removedSessions: 2 });
    });

    it('should return success even when session is not found', async () => {
      mockSessionRepository.find.mockResolvedValue([]);

      const result = await service.logout('user-id', 'refresh-token');

      expect(mockSessionRepository.remove).not.toHaveBeenCalled();
      expect(result).toEqual({ success: true, removedSessions: 0 });
    });
  });

  describe('validateRefreshToken', () => {
    it('should return true when refresh token is valid and not expired', async () => {
      const mockSessions = [
        {
          id: 'session-1',
          refreshTokenHash: await bcrypt.hash('invalid-token', 10),
          expiresAt: new Date(Date.now() + 86400000), // expire in 1 day
        },
        {
          id: 'session-2',
          refreshTokenHash: await bcrypt.hash('valid-token', 10),
          expiresAt: new Date(Date.now() + 86400000), // expire in 1 day
        },
      ];
      mockSessionRepository.find.mockResolvedValue(mockSessions);

      const result = await service.validateRefreshToken('user-id', 'valid-token');

      expect(mockSessionRepository.find).toHaveBeenCalledWith({ where: { userId: 'user-id' } });
      expect(result).toBe(true);
    });

    it('should return false when refresh token is not found', async () => {
      const mockSessions = [
        {
          id: 'session-1',
          refreshTokenHash: await bcrypt.hash('other-token', 10),
          expiresAt: new Date(Date.now() + 86400000), // expire in 1 day
        },
      ];
      mockSessionRepository.find.mockResolvedValue(mockSessions);

      const result = await service.validateRefreshToken('user-id', 'non-existent-token');

      expect(result).toBe(false);
    });

    it('should remove session and return false when token is expired', async () => {
      const expiredDate = new Date(Date.now() - 86400000); // expired 1 day ago
      const mockSession = {
        id: 'session-1',
        refreshTokenHash: await bcrypt.hash('expired-token', 10),
        expiresAt: expiredDate,
      };
      mockSessionRepository.find.mockResolvedValue([mockSession]);

      const result = await service.validateRefreshToken('user-id', 'expired-token');

      expect(mockSessionRepository.remove).toHaveBeenCalledWith(mockSession);
      expect(result).toBe(false);
    });
  });
}); 