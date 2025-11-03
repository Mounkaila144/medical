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
exports.Supplier = void 0;
const typeorm_1 = require("typeorm");
const graphql_1 = require("@nestjs/graphql");
const graphql_type_json_1 = require("graphql-type-json");
const tenant_entity_1 = require("../../auth/entities/tenant.entity");
let Supplier = class Supplier {
    id;
    tenant;
    name;
    contact;
};
exports.Supplier = Supplier;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Supplier.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => tenant_entity_1.Tenant),
    (0, typeorm_1.ManyToOne)(() => tenant_entity_1.Tenant, { nullable: false }),
    __metadata("design:type", tenant_entity_1.Tenant)
], Supplier.prototype, "tenant", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Supplier.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON),
    (0, typeorm_1.Column)({ type: 'json' }),
    __metadata("design:type", Object)
], Supplier.prototype, "contact", void 0);
exports.Supplier = Supplier = __decorate([
    (0, graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)()
], Supplier);
//# sourceMappingURL=supplier.entity.js.map