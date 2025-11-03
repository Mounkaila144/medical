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
exports.WaitQueueTestController = void 0;
const common_1 = require("@nestjs/common");
const wait_queue_service_1 = require("../services/wait-queue.service");
const update_wait_queue_entry_dto_1 = require("../dto/update-wait-queue-entry.dto");
let WaitQueueTestController = class WaitQueueTestController {
    waitQueueService;
    constructor(waitQueueService) {
        this.waitQueueService = waitQueueService;
    }
    test() {
        return { message: 'Wait queue test endpoint works!' };
    }
    async testUpdate(entryId, updateData) {
        const testTenantId = '00000000-0000-0000-0000-000000000000';
        try {
            const result = await this.waitQueueService.updateEntry(testTenantId, entryId, updateData);
            return { success: true, data: result };
        }
        catch (error) {
            return { success: false, error: error.message, type: error.constructor.name };
        }
    }
    async testDelete(entryId) {
        const testTenantId = '00000000-0000-0000-0000-000000000000';
        try {
            await this.waitQueueService.removeEntry(testTenantId, entryId);
            return { success: true, message: 'Entry deleted successfully' };
        }
        catch (error) {
            return { success: false, error: error.message, type: error.constructor.name };
        }
    }
};
exports.WaitQueueTestController = WaitQueueTestController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WaitQueueTestController.prototype, "test", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_wait_queue_entry_dto_1.UpdateWaitQueueEntryDto]),
    __metadata("design:returntype", Promise)
], WaitQueueTestController.prototype, "testUpdate", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WaitQueueTestController.prototype, "testDelete", null);
exports.WaitQueueTestController = WaitQueueTestController = __decorate([
    (0, common_1.Controller)('wait-queue-test'),
    __metadata("design:paramtypes", [wait_queue_service_1.WaitQueueService])
], WaitQueueTestController);
//# sourceMappingURL=wait-queue-test.controller.js.map