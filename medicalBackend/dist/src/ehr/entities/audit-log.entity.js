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
exports.AuditLog = void 0;
const typeorm_1 = require("typeorm");
const graphql_1 = require("@nestjs/graphql");
const user_entity_1 = require("../../auth/entities/user.entity");
const graphql_type_json_1 = require("graphql-type-json");
let AuditLog = class AuditLog {
    id;
    tenantId;
    user;
    userId;
    table;
    column;
    before;
    after;
    changedAt;
    details;
    changes;
};
exports.AuditLog = AuditLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], AuditLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id' }),
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AuditLog.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    (0, graphql_1.Field)(() => user_entity_1.User),
    __metadata("design:type", user_entity_1.User)
], AuditLog.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", String)
], AuditLog.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AuditLog.prototype, "table", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AuditLog.prototype, "column", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { nullable: true }),
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON, { nullable: true }),
    __metadata("design:type", Object)
], AuditLog.prototype, "before", void 0);
__decorate([
    (0, typeorm_1.Column)('json'),
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON),
    __metadata("design:type", Object)
], AuditLog.prototype, "after", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'changed_at' }),
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], AuditLog.prototype, "changedAt", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { nullable: true }),
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON, { nullable: true }),
    __metadata("design:type", Object)
], AuditLog.prototype, "details", void 0);
__decorate([
    (0, typeorm_1.Column)('json'),
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON),
    __metadata("design:type", Object)
], AuditLog.prototype, "changes", void 0);
exports.AuditLog = AuditLog = __decorate([
    (0, graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)('audit_logs')
], AuditLog);
//# sourceMappingURL=audit-log.entity.js.map