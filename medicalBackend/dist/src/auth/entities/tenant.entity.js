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
exports.Tenant = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const graphql_1 = require("@nestjs/graphql");
let Tenant = class Tenant {
    id;
    name;
    slug;
    isActive;
    createdAt;
    users;
};
exports.Tenant = Tenant;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], Tenant.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Tenant.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, unique: true }),
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Tenant.prototype, "slug", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], Tenant.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], Tenant.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => user_entity_1.User, user => user.tenant),
    (0, graphql_1.Field)(() => [user_entity_1.User], { nullable: true }),
    __metadata("design:type", Array)
], Tenant.prototype, "users", void 0);
exports.Tenant = Tenant = __decorate([
    (0, graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)('tenants')
], Tenant);
//# sourceMappingURL=tenant.entity.js.map