import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    
    if (!user) {
      throw new ForbiddenException('Utilisateur non authentifié');
    }
    
    // Gestion de debug pour comprendre ce qui ne va pas
    console.log('Required roles:', requiredRoles);
    console.log('User role:', user.role);
    
    // Comparaison en tant que string pour être compatible avec les types varchar et enum
    const hasRole = requiredRoles.some((role) => {
      // Si user.roles est un tableau, vérifier l'inclusion
      if (Array.isArray(user.roles)) {
        return user.roles.includes(role.toString());
      }
      // Sinon, comparer directement avec user.role (cas le plus courant)
      return user.role === role.toString();
    });
    
    if (!hasRole) {
      throw new ForbiddenException('Accès refusé: rôle insuffisant');
    }
    
    return true;
  }
} 