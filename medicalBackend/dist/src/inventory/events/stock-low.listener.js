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
var StockLowListener_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockLowListener = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const stock_low_event_1 = require("./stock-low.event");
let StockLowListener = StockLowListener_1 = class StockLowListener {
    logger = new common_1.Logger(StockLowListener_1.name);
    handleStockLowEvent(event) {
        this.logger.warn(`ALERTE STOCK BAS: L'article "${event.item.name}" (SKU: ${event.item.sku}) est descendu à ${event.currentStock} unités, en dessous du niveau de réapprovisionnement de ${event.item.reorderLevel}.`);
    }
};
exports.StockLowListener = StockLowListener;
__decorate([
    (0, event_emitter_1.OnEvent)('stock.low'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [stock_low_event_1.StockLowEvent]),
    __metadata("design:returntype", void 0)
], StockLowListener.prototype, "handleStockLowEvent", null);
exports.StockLowListener = StockLowListener = StockLowListener_1 = __decorate([
    (0, common_1.Injectable)()
], StockLowListener);
//# sourceMappingURL=stock-low.listener.js.map