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
exports.SuperadminService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tenant_entity_1 = require("../entities/tenant.entity");
const users_service_1 = require("./users.service");
const user_entity_1 = require("../entities/user.entity");
let SuperadminService = class SuperadminService {
    tenantsRepository;
    usersService;
    constructor(tenantsRepository, usersService) {
        this.tenantsRepository = tenantsRepository;
        this.usersService = usersService;
    }
    async createTenantWithAdmin(createTenantDto) {
        const existingTenant = await this.tenantsRepository.findOne({
            where: { slug: createTenantDto.slug },
        });
        if (existingTenant) {
            throw new common_1.BadRequestException('Un tenant avec ce slug existe déjà');
        }
        const existingUser = await this.usersService.findByEmail(createTenantDto.adminEmail);
        if (existingUser) {
            throw new common_1.BadRequestException('Un utilisateur avec cet email existe déjà');
        }
        const newTenant = this.tenantsRepository.create({
            name: createTenantDto.name,
            slug: createTenantDto.slug,
            isActive: true,
        });
        const savedTenant = await this.tenantsRepository.save(newTenant);
        await this.usersService.createByRole({
            email: createTenantDto.adminEmail,
            password: createTenantDto.adminPassword,
            firstName: createTenantDto.adminFirstName,
            lastName: createTenantDto.adminLastName,
            role: user_entity_1.AuthUserRole.CLINIC_ADMIN,
            tenantId: savedTenant.id,
        });
        return savedTenant;
    }
    async findAllTenants() {
        return this.tenantsRepository.find({
            relations: ['users'],
        });
    }
    async findTenantById(id) {
        const tenant = await this.tenantsRepository.findOne({
            where: { id },
            relations: ['users'],
        });
        if (!tenant) {
            throw new common_1.NotFoundException(`Tenant avec ID ${id} non trouvé`);
        }
        return tenant;
    }
    async deactivateTenant(id) {
        const tenant = await this.findTenantById(id);
        await this.tenantsRepository.update(id, { isActive: false });
        const users = await this.usersService.findAllByTenant(id);
        for (const user of users) {
            await this.usersService.deactivate(user.id);
        }
        return this.findTenantById(id);
    }
    async reactivateTenant(id) {
        const tenant = await this.findTenantById(id);
        await this.tenantsRepository.update(id, { isActive: true });
        const users = await this.usersService.findAllByTenant(id);
        for (const user of users) {
            await this.usersService.reactivate(user.id);
        }
        return this.findTenantById(id);
    }
};
exports.SuperadminService = SuperadminService;
exports.SuperadminService = SuperadminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        users_service_1.UsersService])
], SuperadminService);
//# sourceMappingURL=superadmin.service.js.map