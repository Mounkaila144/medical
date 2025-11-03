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
exports.MedicalHistoryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const medical_history_item_entity_1 = require("../entities/medical-history-item.entity");
const patients_service_1 = require("./patients.service");
let MedicalHistoryService = class MedicalHistoryService {
    medicalHistoryRepository;
    patientsService;
    constructor(medicalHistoryRepository, patientsService) {
        this.medicalHistoryRepository = medicalHistoryRepository;
        this.patientsService = patientsService;
    }
    async addItem(createItemDto, clinicId) {
        await this.patientsService.findOne(createItemDto.patientId, clinicId);
        const historyItem = this.medicalHistoryRepository.create({
            ...createItemDto,
            recordedAt: new Date(),
        });
        return this.medicalHistoryRepository.save(historyItem);
    }
    async remove(id, clinicId) {
        const item = await this.medicalHistoryRepository.findOne({
            where: { id },
            relations: ['patient'],
        });
        if (!item) {
            throw new common_1.NotFoundException(`Medical history item with ID ${id} not found`);
        }
        if (item.patient.clinicId !== clinicId) {
            throw new common_1.NotFoundException(`Medical history item with ID ${id} not found`);
        }
        await this.medicalHistoryRepository.remove(item);
    }
    async listByPatient(patientId, clinicId) {
        await this.patientsService.findOne(patientId, clinicId);
        return this.medicalHistoryRepository.find({
            where: { patientId },
            order: { recordedAt: 'DESC' },
        });
    }
};
exports.MedicalHistoryService = MedicalHistoryService;
exports.MedicalHistoryService = MedicalHistoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(medical_history_item_entity_1.MedicalHistoryItem)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        patients_service_1.PatientsService])
], MedicalHistoryService);
//# sourceMappingURL=medical-history.service.js.map