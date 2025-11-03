"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantId = void 0;
const common_1 = require("@nestjs/common");
exports.TenantId = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    if (!user || !user.tenantId) {
        return null;
    }
    return user.tenantId;
});
//# sourceMappingURL=tenant-id.decorator.js.map