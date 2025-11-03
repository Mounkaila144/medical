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
var PractitionersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PractitionersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const practitioner_entity_1 = require("../entities/practitioner.entity");
const availability_entity_1 = require("../entities/availability.entity");
const create_practitioner_dto_1 = require("../dto/create-practitioner.dto");
const users_service_1 = require("../../auth/services/users.service");
const user_entity_1 = require("../../auth/entities/user.entity");
let PractitionersService = PractitionersService_1 = class PractitionersService {
    practitionerRepository;
    availabilityRepository;
    usersService;
    logger = new common_1.Logger(PractitionersService_1.name);
    constructor(practitionerRepository, availabilityRepository, usersService) {
        this.practitionerRepository = practitionerRepository;
        this.availabilityRepository = availabilityRepository;
        this.usersService = usersService;
    }
    async create(tenantId, createPractitionerDto) {
        let email = createPractitionerDto.email;
        if (!email) {
            const cleanFirstName = createPractitionerDto.firstName.toLowerCase().replace(/[^a-z]/g, '');
            const cleanLastName = createPractitionerDto.lastName.toLowerCase().replace(/[^a-z]/g, '');
            email = `${cleanFirstName}.${cleanLastName}@clinic.com`;
            this.logger.log(`Email généré automatiquement: ${email}`);
        }
        const temporaryPassword = this.generateTemporaryPassword();
        this.logger.log(`Création d'un compte utilisateur pour le praticien: ${createPractitionerDto.firstName} ${createPractitionerDto.lastName}`);
        const user = await this.usersService.createByRole({
            email,
            password: temporaryPassword,
            firstName: createPractitionerDto.firstName,
            lastName: createPractitionerDto.lastName,
            role: user_entity_1.AuthUserRole.PRACTITIONER,
            tenantId,
        });
        this.logger.log(`Utilisateur créé avec l'ID: ${user.id}, Email: ${email}`);
        const practitioner = this.practitionerRepository.create({
            tenantId,
            firstName: createPractitionerDto.firstName,
            lastName: createPractitionerDto.lastName,
            specialty: createPractitionerDto.speciality,
            color: createPractitionerDto.color,
            email: email,
            phoneNumber: createPractitionerDto.phoneNumber,
            slotDuration: createPractitionerDto.slotDuration,
            userId: user.id,
        });
        const savedPractitioner = await this.practitionerRepository.save(practitioner);
        this.logger.log(`Praticien créé avec l'ID: ${savedPractitioner.id}`);
        const availabilities = createPractitionerDto.workingHours.flatMap(workingHour => {
            const weekday = this.mapDayOfWeekToNumber(workingHour.dayOfWeek);
            return workingHour.slots.map(slot => this.availabilityRepository.create({
                practitionerId: savedPractitioner.id,
                weekday,
                start: slot.start,
                end: slot.end,
            }));
        });
        await this.availabilityRepository.save(availabilities);
        this.logger.log(`${availabilities.length} créneaux de disponibilité créés`);
        this.logger.log(`🎉 Praticien créé avec succès !`);
        this.logger.log(`📧 Email de connexion: ${email}`);
        this.logger.log(`🔑 Mot de passe temporaire: ${temporaryPassword}`);
        this.logger.log(`⚠️  Le praticien doit changer son mot de passe lors de la première connexion`);
        return savedPractitioner;
    }
    generateTemporaryPassword() {
        const length = 12;
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        let password = '';
        password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
        password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
        password += '0123456789'[Math.floor(Math.random() * 10)];
        password += '!@#$%^&*'[Math.floor(Math.random() * 8)];
        for (let i = 4; i < length; i++) {
            password += charset[Math.floor(Math.random() * charset.length)];
        }
        return password.split('').sort(() => Math.random() - 0.5).join('');
    }
    async findAll(tenantId) {
        return this.practitionerRepository.find({
            where: { tenantId },
            relations: ['availabilities', 'user'],
            order: { lastName: 'ASC', firstName: 'ASC' },
        });
    }
    async findOne(tenantId, id) {
        const practitioner = await this.practitionerRepository.findOne({
            where: { id, tenantId },
            relations: ['availabilities', 'user'],
        });
        if (!practitioner) {
            throw new Error('Practitioner not found');
        }
        return practitioner;
    }
    async update(tenantId, id, updateData) {
        const practitioner = await this.findOne(tenantId, id);
        if (updateData.firstName)
            practitioner.firstName = updateData.firstName;
        if (updateData.lastName)
            practitioner.lastName = updateData.lastName;
        if (updateData.speciality)
            practitioner.specialty = updateData.speciality;
        if (updateData.color)
            practitioner.color = updateData.color;
        if (updateData.email !== undefined)
            practitioner.email = updateData.email;
        if (updateData.phoneNumber !== undefined)
            practitioner.phoneNumber = updateData.phoneNumber;
        if (updateData.slotDuration !== undefined)
            practitioner.slotDuration = updateData.slotDuration;
        const updatedPractitioner = await this.practitionerRepository.save(practitioner);
        if (updateData.workingHours) {
            await this.availabilityRepository.delete({ practitionerId: id });
            const availabilities = updateData.workingHours.flatMap(workingHour => {
                const weekday = this.mapDayOfWeekToNumber(workingHour.dayOfWeek);
                return workingHour.slots.map(slot => this.availabilityRepository.create({
                    practitionerId: id,
                    weekday,
                    start: slot.start,
                    end: slot.end,
                }));
            });
            await this.availabilityRepository.save(availabilities);
            this.logger.log(`${availabilities.length} créneaux de disponibilité mis à jour`);
        }
        return this.findOne(tenantId, id);
    }
    async delete(tenantId, id) {
        const practitioner = await this.findOne(tenantId, id);
        await this.availabilityRepository.delete({ practitionerId: id });
        await this.practitionerRepository.delete({ id, tenantId });
        this.logger.log(`Practitioner ${id} and associated data deleted`);
    }
    mapDayOfWeekToNumber(dayOfWeek) {
        const mapping = {
            [create_practitioner_dto_1.DayOfWeek.MONDAY]: 1,
            [create_practitioner_dto_1.DayOfWeek.TUESDAY]: 2,
            [create_practitioner_dto_1.DayOfWeek.WEDNESDAY]: 3,
            [create_practitioner_dto_1.DayOfWeek.THURSDAY]: 4,
            [create_practitioner_dto_1.DayOfWeek.FRIDAY]: 5,
            [create_practitioner_dto_1.DayOfWeek.SATURDAY]: 6,
            [create_practitioner_dto_1.DayOfWeek.SUNDAY]: 7,
        };
        return mapping[dayOfWeek];
    }
};
exports.PractitionersService = PractitionersService;
exports.PractitionersService = PractitionersService = PractitionersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(practitioner_entity_1.Practitioner)),
    __param(1, (0, typeorm_1.InjectRepository)(availability_entity_1.Availability)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        users_service_1.UsersService])
], PractitionersService);
//# sourceMappingURL=practitioners.service.js.map