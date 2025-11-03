import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TenantGuard } from './tenant.guard';

describe('TenantGuard', () => {
  let guard: TenantGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<TenantGuard>(TenantGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should throw ForbiddenException when user is not authenticated', () => {
    const context = {
      getType: () => 'http',
      switchToHttp: () => ({
        getRequest: () => ({
          user: null,
          params: { tenantId: 'tenant1' },
        }),
      }),
    } as ExecutionContext;

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should allow access when no tenantId is provided', () => {
    const context = {
      getType: () => 'http',
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: 'user1', tenantId: 'tenant1' },
          params: {},
          query: {},
          headers: {},
        }),
      }),
    } as ExecutionContext;

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access when user belongs to requested tenant', () => {
    const context = {
      getType: () => 'http',
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: 'user1', tenantId: 'tenant1' },
          params: { tenantId: 'tenant1' },
        }),
      }),
    } as ExecutionContext;

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access when user has access to multiple tenants including requested tenant', () => {
    const context = {
      getType: () => 'http',
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: 'user1', tenants: ['tenant1', 'tenant2', 'tenant3'] },
          params: { tenantId: 'tenant2' },
        }),
      }),
    } as ExecutionContext;

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access when user is admin', () => {
    const context = {
      getType: () => 'http',
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: 'admin1', isAdmin: true },
          params: { tenantId: 'tenant1' },
        }),
      }),
    } as ExecutionContext;

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny access when user does not have access to requested tenant', () => {
    const context = {
      getType: () => 'http',
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: 'user1', tenantId: 'tenant1' },
          params: { tenantId: 'tenant2' },
        }),
      }),
    } as ExecutionContext;

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should get tenantId from query parameters if not in path params', () => {
    const context = {
      getType: () => 'http',
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: 'user1', tenantId: 'tenant1' },
          params: {},
          query: { tenantId: 'tenant1' },
        }),
      }),
    } as ExecutionContext;

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should get tenantId from headers if not in path params or query params', () => {
    const context = {
      getType: () => 'http',
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: 'user1', tenantId: 'tenant1' },
          params: {},
          query: {},
          headers: { 'x-tenant-id': 'tenant1' },
        }),
      }),
    } as ExecutionContext;

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should add tenantId to request object', () => {
    const request = {
      user: { id: 'user1', tenantId: 'tenant1' },
      params: { tenantId: 'tenant1' },
    };
    
    const context = {
      getType: () => 'http',
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext;

    guard.canActivate(context);
    expect(request['tenantId']).toBe('tenant1');
  });
}); 