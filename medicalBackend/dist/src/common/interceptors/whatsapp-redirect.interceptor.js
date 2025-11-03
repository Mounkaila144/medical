"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappRedirectInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
let WhatsappRedirectInterceptor = class WhatsappRedirectInterceptor {
    intercept(context, next) {
        return next.handle().pipe((0, operators_1.map)(data => {
            if (data && data.redirectUrl && data.redirectUrl.includes('wa.me')) {
                const response = context.switchToHttp().getResponse();
                response.header('X-Redirect-WhatsApp', 'true');
                return {
                    ...data,
                    redirect_info: {
                        type: 'whatsapp',
                        url: data.redirectUrl,
                        auto_redirect: true,
                        timeout: 2000
                    }
                };
            }
            return data;
        }));
    }
};
exports.WhatsappRedirectInterceptor = WhatsappRedirectInterceptor;
exports.WhatsappRedirectInterceptor = WhatsappRedirectInterceptor = __decorate([
    (0, common_1.Injectable)()
], WhatsappRedirectInterceptor);
//# sourceMappingURL=whatsapp-redirect.interceptor.js.map