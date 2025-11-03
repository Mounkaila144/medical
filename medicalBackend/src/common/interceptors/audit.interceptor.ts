import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    // Injecter un service d'audit si nécessaire
    // private auditService: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, path, params, query, body, headers, user } = request;
    const userAgent = headers['user-agent'] || 'unknown';
    const ip = request.ip || 'unknown';
    const userId = user?.id || 'anonymous';
    
    const startTime = Date.now();
    
    const auditData = {
      method,
      path,
      params,
      query,
      body,
      userId,
      ip,
      userAgent,
      timestamp: new Date(),
    };
    
    return next.handle().pipe(
      tap({
        next: (data) => {
          const responseTime = Date.now() - startTime;
          console.log(`[AUDIT] ${method} ${path} - ${responseTime}ms - User: ${userId} - IP: ${ip}`);
          
          // Logique pour enregistrer l'audit
          // this.auditService.logActivity({
          //   ...auditData,
          //   responseTime,
          //   status: 'success',
          //   response: data
          // });
        },
        error: (error) => {
          const responseTime = Date.now() - startTime;
          console.error(`[AUDIT-ERROR] ${method} ${path} - ${responseTime}ms - User: ${userId} - IP: ${ip} - Error: ${error.message}`);
          
          // Logique pour enregistrer l'erreur
          // this.auditService.logActivity({
          //   ...auditData,
          //   responseTime,
          //   status: 'error',
          //   errorMessage: error.message,
          //   errorStack: error.stack
          // });
        }
      })
    );
  }
} 