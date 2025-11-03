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
exports.PayrollExport = void 0;
const typeorm_1 = require("typeorm");
const graphql_1 = require("@nestjs/graphql");
const tenant_entity_1 = require("./tenant.entity");
let PayrollExport = class PayrollExport {
    id;
    tenantId;
    tenant;
    period;
    filePath;
    generatedAt;
    createdAt;
    updatedAt;
};
exports.PayrollExport = PayrollExport;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PayrollExport.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], PayrollExport.prototype, "tenantId", void 0);
__decorate([
    (0, graphql_1.Field)(() => tenant_entity_1.Tenant),
    (0, typeorm_1.ManyToOne)(() => tenant_entity_1.Tenant),
    (0, typeorm_1.JoinColumn)({ name: 'tenantId' }),
    __metadata("design:type", tenant_entity_1.Tenant)
], PayrollExport.prototype, "tenant", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)({ type: 'varchar', length: 10 }),
    __metadata("design:type", String)
], PayrollExport.prototype, "period", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], PayrollExport.prototype, "filePath", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], PayrollExport.prototype, "generatedAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], PayrollExport.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], PayrollExport.prototype, "updatedAt", void 0);
exports.PayrollExport = PayrollExport = __decorate([
    (0, graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)('payroll_export')
], PayrollExport);
//# sourceMappingURL=payroll-export.entity.js.map