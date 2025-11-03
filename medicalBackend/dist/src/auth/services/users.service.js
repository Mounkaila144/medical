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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const user_entity_1 = require("../entities/user.entity");
let UsersService = class UsersService {
    usersRepository;
    constructor(usersRepository) {
        this.usersRepository = usersRepository;
    }
    async findById(id) {
        const user = await this.usersRepository.findOne({
            where: { id },
            relations: ['tenant']
        });
        if (!user) {
            throw new common_1.NotFoundException(`Utilisateur avec ID ${id} non trouvé`);
        }
        return user;
    }
    async findByEmail(email) {
        return this.usersRepository.findOne({
            where: { email },
            relations: ['tenant']
        });
    }
    async createByRole(createUserDto, createdById) {
        const existingUser = await this.findByEmail(createUserDto.email);
        if (existingUser) {
            throw new common_1.BadRequestException('Cet email est déjà utilisé');
        }
        if (createUserDto.role === user_entity_1.AuthUserRole.SUPERADMIN && createUserDto.tenantId) {
            throw new common_1.BadRequestException('Un super administrateur ne peut pas être associé à un tenant');
        }
        if ((createUserDto.role === user_entity_1.AuthUserRole.CLINIC_ADMIN || createUserDto.role === user_entity_1.AuthUserRole.EMPLOYEE) &&
            !createUserDto.tenantId) {
            throw new common_1.BadRequestException('Un administrateur de clinique ou un employé doit être associé à un tenant');
        }
        const passwordHash = await bcrypt.hash(createUserDto.password, 10);
        const newUser = this.usersRepository.create({
            email: createUserDto.email,
            passwordHash,
            role: createUserDto.role,
            firstName: createUserDto.firstName,
            lastName: createUserDto.lastName,
            tenantId: createUserDto.tenantId || undefined,
        });
        return this.usersRepository.save(newUser);
    }
    async update(id, updateUserDto) {
        const user = await this.findById(id);
        let passwordHash;
        if (updateUserDto.password) {
            passwordHash = await bcrypt.hash(updateUserDto.password, 10);
        }
        await this.usersRepository.update(id, {
            ...updateUserDto,
            ...(passwordHash && { passwordHash }),
        });
        return this.findById(id);
    }
    async deactivate(id) {
        const user = await this.findById(id);
        await this.usersRepository.update(id, { isActive: false });
        return this.findById(id);
    }
    async reactivate(id) {
        const user = await this.findById(id);
        await this.usersRepository.update(id, { isActive: true });
        return this.findById(id);
    }
    async findAllByTenant(tenantId) {
        return this.usersRepository.find({
            where: { tenantId },
            relations: ['tenant'],
        });
    }
    async findAllSuperadmins() {
        return this.usersRepository.find({
            relations: ['tenant'],
            order: { createdAt: 'DESC' }
        });
    }
    async findOnlySuperadmins() {
        return this.usersRepository.find({
            where: { role: user_entity_1.AuthUserRole.SUPERADMIN },
            relations: ['tenant'],
            order: { createdAt: 'DESC' }
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map