import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from '../services/users.service';
import { User, AuthUserRole } from '../entities/user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('UsersService', () => {
  let service: UsersService;

  const mockUserRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: AuthUserRole.EMPLOYEE,
        isActive: true,
        tenant: { id: 'tenant-1', name: 'Clinic A' },
      };
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findById('user-id');

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        relations: ['tenant'],
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user is not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.findById('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('should return user when found', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: AuthUserRole.EMPLOYEE,
        tenant: { id: 'tenant-1' },
      };
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        relations: ['tenant'],
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user is not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('createByRole', () => {
    it('should create a user with hashed password', async () => {
      const createUserDto = {
        email: 'new@example.com',
        password: 'password123',
        role: AuthUserRole.EMPLOYEE,
        firstName: 'New',
        lastName: 'User',
        tenantId: 'tenant-1',
      };

      // findByEmail returns null (email not taken)
      mockUserRepository.findOne.mockResolvedValue(null);

      const createdUser = {
        id: 'new-user-id',
        email: 'new@example.com',
        passwordHash: 'hashed-password',
        role: AuthUserRole.EMPLOYEE,
        firstName: 'New',
        lastName: 'User',
        tenantId: 'tenant-1',
      };
      mockUserRepository.create.mockReturnValue(createdUser);
      mockUserRepository.save.mockResolvedValue(createdUser);

      const result = await service.createByRole(createUserDto);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'new@example.com' },
        relations: ['tenant'],
      });
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: 'new@example.com',
        passwordHash: expect.any(String),
        role: AuthUserRole.EMPLOYEE,
        firstName: 'New',
        lastName: 'User',
        tenantId: 'tenant-1',
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith(createdUser);
      expect(result).toEqual(createdUser);
    });

    it('should throw BadRequestException when email already exists', async () => {
      const createUserDto = {
        email: 'existing@example.com',
        password: 'password123',
        role: AuthUserRole.EMPLOYEE,
        firstName: 'Test',
        lastName: 'User',
        tenantId: 'tenant-1',
      };

      mockUserRepository.findOne.mockResolvedValue({
        id: 'existing-id',
        email: 'existing@example.com',
      });

      await expect(service.createByRole(createUserDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when SUPERADMIN has tenantId', async () => {
      const createUserDto = {
        email: 'admin@example.com',
        password: 'password123',
        role: AuthUserRole.SUPERADMIN,
        firstName: 'Super',
        lastName: 'Admin',
        tenantId: 'tenant-1',
      };

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.createByRole(createUserDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when CLINIC_ADMIN has no tenantId', async () => {
      const createUserDto = {
        email: 'clinicadmin@example.com',
        password: 'password123',
        role: AuthUserRole.CLINIC_ADMIN,
        firstName: 'Clinic',
        lastName: 'Admin',
      };

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.createByRole(createUserDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when EMPLOYEE has no tenantId', async () => {
      const createUserDto = {
        email: 'employee@example.com',
        password: 'password123',
        role: AuthUserRole.EMPLOYEE,
        firstName: 'Employee',
        lastName: 'User',
      };

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.createByRole(createUserDto)).rejects.toThrow(BadRequestException);
    });

    it('should create SUPERADMIN without tenantId', async () => {
      const createUserDto = {
        email: 'admin@example.com',
        password: 'password123',
        role: AuthUserRole.SUPERADMIN,
        firstName: 'Super',
        lastName: 'Admin',
      };

      mockUserRepository.findOne.mockResolvedValue(null);

      const createdUser = {
        id: 'admin-id',
        email: 'admin@example.com',
        passwordHash: 'hashed',
        role: AuthUserRole.SUPERADMIN,
        firstName: 'Super',
        lastName: 'Admin',
        tenantId: undefined,
      };
      mockUserRepository.create.mockReturnValue(createdUser);
      mockUserRepository.save.mockResolvedValue(createdUser);

      const result = await service.createByRole(createUserDto);

      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: 'admin@example.com',
        passwordHash: expect.any(String),
        role: AuthUserRole.SUPERADMIN,
        firstName: 'Super',
        lastName: 'Admin',
        tenantId: undefined,
      });
      expect(result).toEqual(createdUser);
    });
  });

  describe('deactivate', () => {
    it('should set isActive to false', async () => {
      const activeUser = {
        id: 'user-id',
        email: 'test@example.com',
        isActive: true,
        tenant: { id: 'tenant-1' },
      };
      const deactivatedUser = {
        ...activeUser,
        isActive: false,
      };

      // findById is called twice: once to check existence, once to return updated
      mockUserRepository.findOne
        .mockResolvedValueOnce(activeUser)
        .mockResolvedValueOnce(deactivatedUser);
      mockUserRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.deactivate('user-id');

      expect(mockUserRepository.update).toHaveBeenCalledWith('user-id', { isActive: false });
      expect(result.isActive).toBe(false);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.deactivate('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('reactivate', () => {
    it('should set isActive to true', async () => {
      const inactiveUser = {
        id: 'user-id',
        email: 'test@example.com',
        isActive: false,
        tenant: { id: 'tenant-1' },
      };
      const reactivatedUser = {
        ...inactiveUser,
        isActive: true,
      };

      mockUserRepository.findOne
        .mockResolvedValueOnce(inactiveUser)
        .mockResolvedValueOnce(reactivatedUser);
      mockUserRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.reactivate('user-id');

      expect(mockUserRepository.update).toHaveBeenCalledWith('user-id', { isActive: true });
      expect(result.isActive).toBe(true);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.reactivate('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllByTenant', () => {
    it('should return users for a specific tenant', async () => {
      const users = [
        { id: '1', email: 'a@example.com', tenantId: 'tenant-1' },
        { id: '2', email: 'b@example.com', tenantId: 'tenant-1' },
      ];
      mockUserRepository.find.mockResolvedValue(users);

      const result = await service.findAllByTenant('tenant-1');

      expect(mockUserRepository.find).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-1' },
        relations: ['tenant'],
      });
      expect(result).toEqual(users);
      expect(result).toHaveLength(2);
    });
  });
});
