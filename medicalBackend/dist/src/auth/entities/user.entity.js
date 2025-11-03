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
exports.User = exports.AuthUserRole = void 0;
const typeorm_1 = require("typeorm");
const tenant_entity_1 = require("./tenant.entity");
const session_entity_1 = require("./session.entity");
const graphql_1 = require("@nestjs/graphql");
var AuthUserRole;
(function (AuthUserRole) {
    AuthUserRole["SUPERADMIN"] = "SUPERADMIN";
    AuthUserRole["CLINIC_ADMIN"] = "CLINIC_ADMIN";
    AuthUserRole["EMPLOYEE"] = "EMPLOYEE";
    AuthUserRole["PRACTITIONER"] = "PRACTITIONER";
})(AuthUserRole || (exports.AuthUserRole = AuthUserRole = {}));
(0, graphql_1.registerEnumType)(AuthUserRole, {
    name: 'AuthUserRole',
});
let User = class User {
    id;
    tenant;
    tenantId;
    email;
    passwordHash;
    role;
    firstName;
    lastName;
    isActive;
    lastLogin;
    createdAt;
    updatedAt;
    sessions;
};
exports.User = User;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tenant_entity_1.Tenant, tenant => tenant.users, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'tenantId' }),
    __metadata("design:type", tenant_entity_1.Tenant)
], User.prototype, "tenant", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], User.prototype, "tenantId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], User.prototype, "passwordHash", void 0);
__decorate([
    (0, graphql_1.Field)(() => AuthUserRole),
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, default: AuthUserRole.EMPLOYEE }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], User.prototype, "firstName", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], User.prototype, "lastName", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], User.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], User.prototype, "lastLogin", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => [session_entity_1.Session], { nullable: true }),
    (0, typeorm_1.OneToMany)(() => session_entity_1.Session, session => session.user),
    __metadata("design:type", Array)
], User.prototype, "sessions", void 0);
exports.User = User = __decorate([
    (0, graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)('users')
], User);
//# sourceMappingURL=user.entity.js.map