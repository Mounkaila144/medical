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
exports.WaitQueueController = void 0;
const common_1 = require("@nestjs/common");
const wait_queue_service_1 = require("../services/wait-queue.service");
const create_wait_queue_entry_dto_1 = require("../dto/create-wait-queue-entry.dto");
const update_wait_queue_entry_dto_1 = require("../dto/update-wait-queue-entry.dto");
const tenant_id_decorator_1 = require("../../common/decorators/tenant-id.decorator");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const tenant_guard_1 = require("../../common/guards/tenant.guard");
let WaitQueueController = class WaitQueueController {
    waitQueueService;
    constructor(waitQueueService) {
        this.waitQueueService = waitQueueService;
    }
    async addToQueue(tenantId, createDto) {
        return this.waitQueueService.enqueue(tenantId, createDto);
    }
    async enqueue(tenantId, createDto) {
        return this.waitQueueService.enqueue(tenantId, createDto);
    }
    async callNext(tenantId) {
        return this.waitQueueService.callNext(tenantId);
    }
    async getQueue(tenantId) {
        return this.waitQueueService.getQueue(tenantId);
    }
    async getCurrentlyServing(tenantId) {
        return this.waitQueueService.getCurrentlyServing(tenantId);
    }
    async markAsServing(tenantId, entryId) {
        return this.waitQueueService.markAsServing(tenantId, entryId);
    }
    async complete(tenantId, entryId) {
        return this.waitQueueService.complete(tenantId, entryId);
    }
    async updateEntry(tenantId, entryId, updateData) {
        return this.waitQueueService.updateEntry(tenantId, entryId, updateData);
    }
    async removeEntry(tenantId, entryId) {
        return this.waitQueueService.removeEntry(tenantId, entryId);
    }
};
exports.WaitQueueController = WaitQueueController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_wait_queue_entry_dto_1.CreateWaitQueueEntryDto]),
    __metadata("design:returntype", Promise)
], WaitQueueController.prototype, "addToQueue", null);
__decorate([
    (0, common_1.Post)('enqueue'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_wait_queue_entry_dto_1.CreateWaitQueueEntryDto]),
    __metadata("design:returntype", Promise)
], WaitQueueController.prototype, "enqueue", null);
__decorate([
    (0, common_1.Post)('call-next'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WaitQueueController.prototype, "callNext", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WaitQueueController.prototype, "getQueue", null);
__decorate([
    (0, common_1.Get)('currently-serving'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WaitQueueController.prototype, "getCurrentlyServing", null);
__decorate([
    (0, common_1.Post)(':id/mark-serving'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WaitQueueController.prototype, "markAsServing", null);
__decorate([
    (0, common_1.Post)(':id/complete'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WaitQueueController.prototype, "complete", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_wait_queue_entry_dto_1.UpdateWaitQueueEntryDto]),
    __metadata("design:returntype", Promise)
], WaitQueueController.prototype, "updateEntry", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WaitQueueController.prototype, "removeEntry", null);
exports.WaitQueueController = WaitQueueController = __decorate([
    (0, common_1.Controller)('wait-queue'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_guard_1.TenantGuard),
    __metadata("design:paramtypes", [wait_queue_service_1.WaitQueueService])
], WaitQueueController);
//# sourceMappingURL=wait-queue.controller.js.map