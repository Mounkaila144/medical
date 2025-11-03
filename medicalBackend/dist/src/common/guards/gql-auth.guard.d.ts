import { ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
declare const GqlAuthGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class GqlAuthGuard extends GqlAuthGuard_base {
    getRequest(context: ExecutionContext): any;
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean>;
}
export {};
