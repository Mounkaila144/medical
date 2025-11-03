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
exports.LabResultsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const lab_result_entity_1 = require("../entities/lab-result.entity");
let LabResultsService = class LabResultsService {
    labResultsRepository;
    constructor(labResultsRepository) {
        this.labResultsRepository = labResultsRepository;
    }
    async add(tenantId, createLabResultDto) {
        const labResult = this.labResultsRepository.create({
            tenantId,
            patientId: createLabResultDto.patientId,
            encounterId: createLabResultDto.encounterId,
            labName: createLabResultDto.labName,
            result: createLabResultDto.result,
            filePath: createLabResultDto.filePath,
            receivedAt: createLabResultDto.receivedAt || new Date(),
        });
        return this.labResultsRepository.save(labResult);
    }
    async findAll(tenantId) {
        return this.labResultsRepository.find({
            where: { tenantId },
            relations: ['patient', 'encounter'],
        });
    }
    async findAllByPatient(tenantId, patientId) {
        return this.labResultsRepository.find({
            where: { tenantId, patientId },
            relations: ['encounter'],
            order: { receivedAt: 'DESC' },
        });
    }
    async findOne(id) {
        const labResult = await this.labResultsRepository.findOne({
            where: { id },
            relations: ['patient', 'encounter'],
        });
        if (!labResult) {
            throw new common_1.NotFoundException(`Résultat d'analyse avec ID ${id} non trouvé`);
        }
        return labResult;
    }
};
exports.LabResultsService = LabResultsService;
exports.LabResultsService = LabResultsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(lab_result_entity_1.LabResult)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], LabResultsService);
//# sourceMappingURL=lab-results.service.js.map