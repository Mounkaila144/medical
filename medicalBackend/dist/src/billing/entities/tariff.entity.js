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
exports.Tariff = exports.TariffCategory = void 0;
const typeorm_1 = require("typeorm");
const graphql_1 = require("@nestjs/graphql");
var TariffCategory;
(function (TariffCategory) {
    TariffCategory["CONSULTATION"] = "CONSULTATION";
    TariffCategory["PROCEDURE"] = "PROCEDURE";
    TariffCategory["LABORATORY"] = "LABORATORY";
    TariffCategory["IMAGING"] = "IMAGING";
    TariffCategory["MEDICATION"] = "MEDICATION";
    TariffCategory["OTHER"] = "OTHER";
})(TariffCategory || (exports.TariffCategory = TariffCategory = {}));
(0, graphql_1.registerEnumType)(TariffCategory, {
    name: 'TariffCategory',
});
let Tariff = class Tariff {
    id;
    tenantId;
    code;
    name;
    description;
    category;
    costPrice;
    price;
    currency;
    duration;
    isActive;
    createdAt;
    updatedAt;
};
exports.Tariff = Tariff;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], Tariff.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id' }),
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Tariff.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Tariff.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Tariff.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Tariff.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: TariffCategory,
        default: TariffCategory.CONSULTATION,
    }),
    (0, graphql_1.Field)(() => TariffCategory),
    __metadata("design:type", String)
], Tariff.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Number)
], Tariff.prototype, "costPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    (0, graphql_1.Field)(),
    __metadata("design:type", Number)
], Tariff.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'XOF' }),
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Tariff.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Number)
], Tariff.prototype, "duration", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], Tariff.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], Tariff.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], Tariff.prototype, "updatedAt", void 0);
exports.Tariff = Tariff = __decorate([
    (0, graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)('tariffs')
], Tariff);
//# sourceMappingURL=tariff.entity.js.map