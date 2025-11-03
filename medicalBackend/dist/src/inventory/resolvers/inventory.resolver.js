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
exports.InventoryResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const user_entity_1 = require("../../auth/entities/user.entity");
const inventory_service_1 = require("../services/inventory.service");
const item_entity_1 = require("../entities/item.entity");
const movement_entity_1 = require("../entities/movement.entity");
const movement_dto_1 = require("../dto/movement.dto");
let InventoryResolver = class InventoryResolver {
    inventoryService;
    constructor(inventoryService) {
        this.inventoryService = inventoryService;
    }
    async lowStockItems(user) {
        return this.inventoryService.listLow();
    }
    async receiveItem(input, user) {
        return this.inventoryService.receive(input.itemId, input.quantity, input.lotNumber, input.expiry, input.reference);
    }
    async dispenseItem(input, user) {
        return this.inventoryService.dispense(input.itemId, input.quantity, input.reason, input.reference);
    }
    async adjustItem(input, user) {
        return this.inventoryService.adjust(input.itemId, input.lotId, input.newQuantity, input.reason);
    }
};
exports.InventoryResolver = InventoryResolver;
__decorate([
    (0, graphql_1.Query)(() => [item_entity_1.Item]),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], InventoryResolver.prototype, "lowStockItems", null);
__decorate([
    (0, graphql_1.Mutation)(() => movement_entity_1.Movement),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [movement_dto_1.ReceiveItemInput,
        user_entity_1.User]),
    __metadata("design:returntype", Promise)
], InventoryResolver.prototype, "receiveItem", null);
__decorate([
    (0, graphql_1.Mutation)(() => movement_entity_1.Movement),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [movement_dto_1.DispenseItemInput,
        user_entity_1.User]),
    __metadata("design:returntype", Promise)
], InventoryResolver.prototype, "dispenseItem", null);
__decorate([
    (0, graphql_1.Mutation)(() => movement_entity_1.Movement),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [movement_dto_1.AdjustItemInput,
        user_entity_1.User]),
    __metadata("design:returntype", Promise)
], InventoryResolver.prototype, "adjustItem", null);
exports.InventoryResolver = InventoryResolver = __decorate([
    (0, graphql_1.Resolver)(() => item_entity_1.Item),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [inventory_service_1.InventoryService])
], InventoryResolver);
//# sourceMappingURL=inventory.resolver.js.map