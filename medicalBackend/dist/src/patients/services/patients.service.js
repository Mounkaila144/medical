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
exports.PatientsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const patient_entity_1 = require("../entities/patient.entity");
const microservices_1 = require("@nestjs/microservices");
const common_2 = require("@nestjs/common");
let PatientsService = class PatientsService {
    patientsRepository;
    rabbitmqClient;
    constructor(patientsRepository, rabbitmqClient) {
        this.patientsRepository = patientsRepository;
        this.rabbitmqClient = rabbitmqClient;
    }
    async create(createPatientDto, tenantId) {
        const { age, dob: providedDob, ...patientData } = createPatientDto;
        let dob = providedDob;
        if (age !== undefined && age !== null) {
            const derivedDob = new Date();
            derivedDob.setFullYear(derivedDob.getFullYear() - age);
            dob = derivedDob;
        }
        const defaultAddress = { city: 'Niamey' };
        const patient = new patient_entity_1.Patient();
        Object.assign(patient, {
            ...patientData,
            ...(dob ? { dob } : {}),
            address: patientData.address ?? defaultAddress,
            clinicId: tenantId,
        });
        const savedPatient = await this.patientsRepository.save(patient);
        try {
            this.rabbitmqClient.emit('patient.created', {
                patient: savedPatient,
                timestamp: new Date(),
            });
        }
        catch (error) {
            console.error('Erreur lors de l\'émission de l\'événement RabbitMQ:', error);
        }
        return savedPatient;
    }
    async findAll(tenantId) {
        return this.patientsRepository.find({
            where: { clinicId: tenantId },
        });
    }
    async findOne(id, tenantId) {
        const patient = await this.patientsRepository.findOne({
            where: { id, clinicId: tenantId },
            relations: ['medicalHistory', 'documents'],
        });
        if (!patient) {
            throw new common_1.NotFoundException(`Patient avec l'ID ${id} non trouvé`);
        }
        return patient;
    }
    async update(id, updatePatientDto, tenantId) {
        const patient = await this.findOne(id, tenantId);
        if (updatePatientDto.clinicId && updatePatientDto.clinicId !== tenantId) {
            throw new common_1.ForbiddenException('Modification du clinicId non autorisée');
        }
        Object.assign(patient, updatePatientDto);
        return this.patientsRepository.save(patient);
    }
    async archive(id, tenantId) {
        const patient = await this.findOne(id, tenantId);
        await this.patientsRepository.softDelete(patient.id);
    }
    async search(searchParams) {
        const { search, clinicId, ...filters } = searchParams;
        if (!clinicId) {
            throw new common_1.ForbiddenException('Accès non autorisé: clinicId requis');
        }
        const queryBuilder = this.patientsRepository.createQueryBuilder('patient');
        queryBuilder.where('patient.clinicId = :clinicId', { clinicId });
        if (search) {
            queryBuilder.andWhere('(patient.firstName ILIKE :search OR patient.lastName ILIKE :search OR patient.mrn ILIKE :search OR patient.email ILIKE :search)', { search: `%${search}%` });
        }
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                if (typeof value === 'string') {
                    queryBuilder.andWhere(`patient.${key} ILIKE :${key}`, { [key]: `%${value}%` });
                }
                else {
                    queryBuilder.andWhere(`patient.${key} = :${key}`, { [key]: value });
                }
            }
        });
        return queryBuilder.getMany();
    }
};
exports.PatientsService = PatientsService;
exports.PatientsService = PatientsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(patient_entity_1.Patient)),
    __param(1, (0, common_2.Inject)('RABBITMQ_SERVICE')),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        microservices_1.ClientProxy])
], PatientsService);
//# sourceMappingURL=patients.service.js.map