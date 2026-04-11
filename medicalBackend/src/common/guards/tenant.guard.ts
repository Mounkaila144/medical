import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';
import { AuthUserRole } from '../../auth/entities/user.entity';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isGraphQL = context.getType().toString() !== 'http';
    
    let request;
    if (isGraphQL) {
      const ctx = GqlExecutionContext.create(context);
      request = ctx.getContext().req;
    } else {
      request = context.switchToHttp().getRequest();
    }

    const user = request.user;
    
    if (!user) {
      throw new ForbiddenException('Vous n\'avez pas accès à ce tenant');
    }
    
    // Récupérer le tenantId demandé à partir des paramètres, requête ou en-têtes
    const requestedTenantId = 
      request.params?.tenantId || 
      request.query?.tenantId || 
      request.headers?.['x-tenant-id'];
      
    // Si aucun tenantId n'est demandé, on autorise l'accès
    if (!requestedTenantId) {
      return true;
    }
    
    // Ajouter le tenantId à l'objet request pour une utilisation ultérieure
    request['tenantId'] = requestedTenantId;
    
    // Les SUPERADMIN ont accès à tous les tenants
    if (user.role === AuthUserRole.SUPERADMIN) {
      return true;
    }
    
    // Vérifier si l'utilisateur a accès au tenant demandé
    if (
      user.tenantId === requestedTenantId || 
      (user.tenants && user.tenants.includes(requestedTenantId))
    ) {
      return true;
    }
    
    throw new ForbiddenException(`Vous n'avez pas accès au tenant ${requestedTenantId}`);
  }
} 