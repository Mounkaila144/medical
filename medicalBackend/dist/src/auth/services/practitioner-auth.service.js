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
exports.PractitionerAuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const practitioner_entity_1 = require("../../scheduling/entities/practitioner.entity");
const user_entity_1 = require("../entities/user.entity");
const user_entity_2 = require("../entities/user.entity");
let PractitionerAuthService = class PractitionerAuthService {
    practitionerRepository;
    userRepository;
    constructor(practitionerRepository, userRepository) {
        this.practitionerRepository = practitionerRepository;
        this.userRepository = userRepository;
    }
    async validatePractitioner(userId) {
        const user = await this.userRepository.findOne({
            where: { id: userId, role: user_entity_2.AuthUserRole.PRACTITIONER },
        });
        if (!user) {
            return null;
        }
        const practitioner = await this.practitionerRepository.findOne({
            where: { userId: userId },
            relations: ['user'],
        });
        return practitioner;
    }
    async getPractitionerByUserId(userId) {
        const practitioner = await this.practitionerRepository.findOne({
            where: { userId: userId },
            relations: ['user'],
        });
        if (!practitioner) {
            throw new common_1.NotFoundException('Praticien non trouvé pour cet utilisateur');
        }
        return practitioner;
    }
    async linkUserToPractitioner(userId, practitionerId) {
        const user = await this.userRepository.findOne({
            where: { id: userId, role: user_entity_2.AuthUserRole.PRACTITIONER },
        });
        if (!user) {
            throw new common_1.NotFoundException('Utilisateur praticien non trouvé');
        }
        const practitioner = await this.practitionerRepository.findOne({
            where: { id: practitionerId },
        });
        if (!practitioner) {
            throw new common_1.NotFoundException('Praticien non trouvé');
        }
        practitioner.userId = userId;
        return await this.practitionerRepository.save(practitioner);
    }
    async getAllPractitionersWithUsers(tenantId) {
        return await this.practitionerRepository.find({
            where: { tenantId },
            relations: ['user'],
        });
    }
};
exports.PractitionerAuthService = PractitionerAuthService;
exports.PractitionerAuthService = PractitionerAuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(practitioner_entity_1.Practitioner)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], PractitionerAuthService);
//# sourceMappingURL=practitioner-auth.service.js.map