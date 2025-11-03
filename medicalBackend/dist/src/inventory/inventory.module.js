"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const item_entity_1 = require("./entities/item.entity");
const lot_entity_1 = require("./entities/lot.entity");
const movement_entity_1 = require("./entities/movement.entity");
const supplier_entity_1 = require("./entities/supplier.entity");
const inventory_service_1 = require("./services/inventory.service");
const supplier_service_1 = require("./services/supplier.service");
const inventory_resolver_1 = require("./resolvers/inventory.resolver");
const supplier_resolver_1 = require("./resolvers/supplier.resolver");
const inventory_controller_1 = require("./controllers/inventory.controller");
const stock_low_listener_1 = require("./events/stock-low.listener");
let InventoryModule = class InventoryModule {
};
exports.InventoryModule = InventoryModule;
exports.InventoryModule = InventoryModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([item_entity_1.Item, lot_entity_1.Lot, movement_entity_1.Movement, supplier_entity_1.Supplier]),
        ],
        controllers: [
            inventory_controller_1.InventoryController,
        ],
        providers: [
            inventory_service_1.InventoryService,
            supplier_service_1.SupplierService,
            inventory_resolver_1.InventoryResolver,
            supplier_resolver_1.SupplierResolver,
            stock_low_listener_1.StockLowListener,
        ],
        exports: [
            inventory_service_1.InventoryService,
            supplier_service_1.SupplierService,
        ],
    })
], InventoryModule);
//# sourceMappingURL=inventory.module.js.map