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
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const item_entity_1 = require("../entities/item.entity");
const lot_entity_1 = require("../entities/lot.entity");
const movement_entity_1 = require("../entities/movement.entity");
const stock_low_event_1 = require("../events/stock-low.event");
let InventoryService = class InventoryService {
    itemRepository;
    lotRepository;
    movementRepository;
    dataSource;
    eventEmitter;
    constructor(itemRepository, lotRepository, movementRepository, dataSource, eventEmitter) {
        this.itemRepository = itemRepository;
        this.lotRepository = lotRepository;
        this.movementRepository = movementRepository;
        this.dataSource = dataSource;
        this.eventEmitter = eventEmitter;
    }
    async findItemById(id) {
        const item = await this.itemRepository.findOne({ where: { id } });
        if (!item) {
            throw new common_1.NotFoundException(`Item with ID ${id} not found`);
        }
        return item;
    }
    async receive(itemId, quantity, lotNumber, expiry, supplierId, reference) {
        return this.dataSource.transaction(async (manager) => {
            const item = await manager.findOne(item_entity_1.Item, { where: { id: itemId }, relations: ['lots'] });
            if (!item) {
                throw new common_1.NotFoundException(`Item with ID ${itemId} not found`);
            }
            let lot = await manager.findOne(lot_entity_1.Lot, { where: { item: { id: itemId }, lotNumber } });
            if (lot) {
                lot.quantity = +lot.quantity + quantity;
                await manager.save(lot_entity_1.Lot, lot);
            }
            else {
                lot = manager.create(lot_entity_1.Lot, {
                    item,
                    lotNumber,
                    expiry,
                    quantity,
                });
                await manager.save(lot_entity_1.Lot, lot);
            }
            const movement = manager.create(movement_entity_1.Movement, {
                item,
                type: movement_entity_1.MovementType.IN,
                qty: quantity,
                reference: supplierId || reference,
                reason: 'Réception en stock',
            });
            return manager.save(movement_entity_1.Movement, movement);
        });
    }
    async dispense(itemId, quantity, reason, reference) {
        return this.dataSource.transaction(async (manager) => {
            const item = await manager.findOne(item_entity_1.Item, { where: { id: itemId } });
            if (!item) {
                throw new common_1.NotFoundException(`Item with ID ${itemId} not found`);
            }
            const currentStock = await this.calculateItemStock(itemId);
            if (currentStock < quantity) {
                throw new Error(`Insufficient stock for item ${item.name}. Available: ${currentStock}, Requested: ${quantity}`);
            }
            const movement = manager.create(movement_entity_1.Movement, {
                item,
                type: movement_entity_1.MovementType.OUT,
                qty: quantity,
                reason,
                reference,
            });
            await manager.save(movement_entity_1.Movement, movement);
            let remainingQty = quantity;
            const lots = await manager.find(lot_entity_1.Lot, {
                where: { item: { id: itemId } },
                order: { expiry: 'ASC' }
            });
            for (const lot of lots) {
                if (remainingQty <= 0)
                    break;
                if (lot.quantity > 0) {
                    const qtyToRemove = Math.min(lot.quantity, remainingQty);
                    lot.quantity = +lot.quantity - qtyToRemove;
                    remainingQty -= qtyToRemove;
                    await manager.save(lot_entity_1.Lot, lot);
                }
            }
            const newStock = await this.calculateItemStock(itemId);
            if (newStock <= item.reorderLevel) {
                this.eventEmitter.emit('stock.low', new stock_low_event_1.StockLowEvent(item, newStock));
            }
            return movement;
        });
    }
    async adjust(itemId, lotId, newQuantity, reason) {
        return this.dataSource.transaction(async (manager) => {
            const item = await manager.findOne(item_entity_1.Item, { where: { id: itemId } });
            if (!item) {
                throw new common_1.NotFoundException(`Item with ID ${itemId} not found`);
            }
            const lot = await manager.findOne(lot_entity_1.Lot, { where: { id: lotId, item: { id: itemId } } });
            if (!lot) {
                throw new common_1.NotFoundException(`Lot with ID ${lotId} not found for item ${itemId}`);
            }
            const oldQuantity = +lot.quantity;
            const difference = newQuantity - oldQuantity;
            const movement = manager.create(movement_entity_1.Movement, {
                item,
                type: movement_entity_1.MovementType.ADJUST,
                qty: Math.abs(difference),
                reason: `${reason} (${difference > 0 ? '+' : ''}${difference})`,
            });
            await manager.save(movement_entity_1.Movement, movement);
            lot.quantity = newQuantity;
            await manager.save(lot_entity_1.Lot, lot);
            const newStock = await this.calculateItemStock(itemId);
            if (newStock <= item.reorderLevel) {
                this.eventEmitter.emit('stock.low', new stock_low_event_1.StockLowEvent(item, newStock));
            }
            return movement;
        });
    }
    async listLow() {
        const items = await this.itemRepository.find();
        const lowStockItems = [];
        for (const item of items) {
            const stock = await this.calculateItemStock(item.id);
            if (stock <= item.reorderLevel) {
                lowStockItems.push({
                    ...item,
                    currentStock: stock,
                });
            }
        }
        return lowStockItems;
    }
    async calculateItemStock(itemId) {
        const lots = await this.lotRepository.find({
            where: { item: { id: itemId } },
        });
        return lots.reduce((total, lot) => total + +lot.quantity, 0);
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(item_entity_1.Item)),
    __param(1, (0, typeorm_1.InjectRepository)(lot_entity_1.Lot)),
    __param(2, (0, typeorm_1.InjectRepository)(movement_entity_1.Movement)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource,
        event_emitter_1.EventEmitter2])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map