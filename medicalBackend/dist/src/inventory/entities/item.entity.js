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
exports.Item = exports.ItemUnit = exports.ItemCategory = void 0;
const typeorm_1 = require("typeorm");
const graphql_1 = require("@nestjs/graphql");
const tenant_entity_1 = require("../../auth/entities/tenant.entity");
const lot_entity_1 = require("./lot.entity");
const movement_entity_1 = require("./movement.entity");
var ItemCategory;
(function (ItemCategory) {
    ItemCategory["DRUG"] = "DRUG";
    ItemCategory["CONSUMABLE"] = "CONSUMABLE";
})(ItemCategory || (exports.ItemCategory = ItemCategory = {}));
var ItemUnit;
(function (ItemUnit) {
    ItemUnit["BOX"] = "BOX";
    ItemUnit["PIECE"] = "PIECE";
    ItemUnit["ML"] = "ML";
})(ItemUnit || (exports.ItemUnit = ItemUnit = {}));
(0, graphql_1.registerEnumType)(ItemCategory, {
    name: 'ItemCategory',
});
(0, graphql_1.registerEnumType)(ItemUnit, {
    name: 'ItemUnit',
});
let Item = class Item {
    id;
    tenant;
    sku;
    name;
    category;
    unit;
    reorderLevel;
    lots;
    movements;
};
exports.Item = Item;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Item.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    (0, typeorm_1.ManyToOne)(() => tenant_entity_1.Tenant, { nullable: false }),
    __metadata("design:type", tenant_entity_1.Tenant)
], Item.prototype, "tenant", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    (0, typeorm_1.Column)(),
    (0, typeorm_1.Index)({ unique: true }),
    __metadata("design:type", String)
], Item.prototype, "sku", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Item.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(() => ItemCategory),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ItemCategory,
    }),
    __metadata("design:type", String)
], Item.prototype, "category", void 0);
__decorate([
    (0, graphql_1.Field)(() => ItemUnit),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ItemUnit,
    }),
    __metadata("design:type", String)
], Item.prototype, "unit", void 0);
__decorate([
    (0, graphql_1.Field)(() => Number),
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Item.prototype, "reorderLevel", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => lot_entity_1.Lot, lot => lot.item),
    __metadata("design:type", Array)
], Item.prototype, "lots", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => movement_entity_1.Movement, movement => movement.item),
    __metadata("design:type", Array)
], Item.prototype, "movements", void 0);
exports.Item = Item = __decorate([
    (0, graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)()
], Item);
//# sourceMappingURL=item.entity.js.map