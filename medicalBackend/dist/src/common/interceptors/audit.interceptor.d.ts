import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
export declare class AuditInterceptor implements NestInterceptor {
    constructor();
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
}
