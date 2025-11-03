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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicWaitQueueController = void 0;
const common_1 = require("@nestjs/common");
const wait_queue_service_1 = require("../services/wait-queue.service");
const wait_queue_entry_entity_1 = require("../entities/wait-queue-entry.entity");
const public_decorator_1 = require("../../common/decorators/public.decorator");
let PublicWaitQueueController = class PublicWaitQueueController {
    waitQueueService;
    constructor(waitQueueService) {
        this.waitQueueService = waitQueueService;
    }
    async takeNumber(data, tenantId) {
        const tenant = tenantId || process.env.DEFAULT_TENANT_ID || '';
        if (!tenant) {
            throw new Error('Tenant ID is required. Please provide ?tenant=xxx or set DEFAULT_TENANT_ID env variable');
        }
        return this.waitQueueService.enqueue(tenant, {
            patientId: undefined,
            practitionerId: undefined,
            priority: data.priority || wait_queue_entry_entity_1.Priority.NORMAL,
            reason: data.reason || 'Consultation',
        });
    }
    async getQueue(tenantId) {
        const tenant = tenantId || process.env.DEFAULT_TENANT_ID || '';
        if (!tenant) {
            throw new Error('Tenant ID is required. Please provide ?tenant=xxx or set DEFAULT_TENANT_ID env variable');
        }
        return this.waitQueueService.getQueue(tenant);
    }
    async getCurrentlyServing(tenantId) {
        const tenant = tenantId || process.env.DEFAULT_TENANT_ID || '';
        if (!tenant) {
            throw new Error('Tenant ID is required. Please provide ?tenant=xxx or set DEFAULT_TENANT_ID env variable');
        }
        return this.waitQueueService.getCurrentlyServing(tenant);
    }
};
exports.PublicWaitQueueController = PublicWaitQueueController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)('tenant')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PublicWaitQueueController.prototype, "takeNumber", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('tenant')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PublicWaitQueueController.prototype, "getQueue", null);
__decorate([
    (0, common_1.Get)('currently-serving'),
    __param(0, (0, common_1.Query)('tenant')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PublicWaitQueueController.prototype, "getCurrentlyServing", null);
exports.PublicWaitQueueController = PublicWaitQueueController = __decorate([
    (0, common_1.Controller)('public/wait-queue'),
    (0, public_decorator_1.Public)(),
    __metadata("design:paramtypes", [wait_queue_service_1.WaitQueueService])
], PublicWaitQueueController);
//# sourceMappingURL=public-wait-queue.controller.js.map