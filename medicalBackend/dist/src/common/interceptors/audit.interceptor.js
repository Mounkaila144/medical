"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
let AuditInterceptor = class AuditInterceptor {
    constructor() { }
    intercept(context, next) {
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
        return next.handle().pipe((0, operators_1.tap)({
            next: (data) => {
                const responseTime = Date.now() - startTime;
                console.log(`[AUDIT] ${method} ${path} - ${responseTime}ms - User: ${userId} - IP: ${ip}`);
            },
            error: (error) => {
                const responseTime = Date.now() - startTime;
                console.error(`[AUDIT-ERROR] ${method} ${path} - ${responseTime}ms - User: ${userId} - IP: ${ip} - Error: ${error.message}`);
            }
        }));
    }
};
exports.AuditInterceptor = AuditInterceptor;
exports.AuditInterceptor = AuditInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], AuditInterceptor);
//# sourceMappingURL=audit.interceptor.js.map