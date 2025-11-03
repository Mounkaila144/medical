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
exports.EncountersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const encounter_entity_1 = require("../entities/encounter.entity");
const event_emitter_1 = require("@nestjs/event-emitter");
const encounter_locked_event_1 = require("../events/encounter-locked.event");
let EncountersService = class EncountersService {
    encountersRepository;
    eventEmitter;
    constructor(encountersRepository, eventEmitter) {
        this.encountersRepository = encountersRepository;
        this.eventEmitter = eventEmitter;
    }
    async create(tenantId, createEncounterDto) {
        const encounter = this.encountersRepository.create({
            tenantId,
            patientId: createEncounterDto.patientId,
            practitionerId: createEncounterDto.practitionerId,
            startAt: createEncounterDto.startAt,
            endAt: createEncounterDto.endAt,
            motive: createEncounterDto.motive,
            exam: createEncounterDto.exam,
            diagnosis: createEncounterDto.diagnosis,
            icd10Codes: createEncounterDto.icd10Codes || [],
        });
        return this.encountersRepository.save(encounter);
    }
    async findAll(tenantId) {
        return this.encountersRepository.find({
            where: { tenantId },
            relations: ['patient', 'practitioner', 'prescriptions', 'labResults'],
        });
    }
    async findOne(id) {
        const encounter = await this.encountersRepository.findOne({
            where: { id },
            relations: ['patient', 'practitioner', 'prescriptions', 'labResults'],
        });
        if (!encounter) {
            throw new common_1.NotFoundException(`Consultation avec ID ${id} non trouvée`);
        }
        return encounter;
    }
    async update(tenantId, updateEncounterDto) {
        const encounter = await this.encountersRepository.findOne({
            where: { id: updateEncounterDto.id, tenantId },
        });
        if (!encounter) {
            throw new common_1.NotFoundException(`Consultation avec ID ${updateEncounterDto.id} non trouvée`);
        }
        if (encounter.locked) {
            throw new common_1.ForbiddenException('La consultation est verrouillée et ne peut pas être modifiée');
        }
        Object.assign(encounter, updateEncounterDto);
        return this.encountersRepository.save(encounter);
    }
    async lock(tenantId, lockEncounterDto) {
        const encounter = await this.encountersRepository.findOne({
            where: { id: lockEncounterDto.id, tenantId },
            relations: ['patient', 'practitioner'],
        });
        if (!encounter) {
            throw new common_1.NotFoundException(`Consultation avec ID ${lockEncounterDto.id} non trouvée`);
        }
        encounter.locked = true;
        const savedEncounter = await this.encountersRepository.save(encounter);
        this.eventEmitter.emit('encounter.locked', new encounter_locked_event_1.EncounterLockedEvent(savedEncounter));
        return savedEncounter;
    }
};
exports.EncountersService = EncountersService;
exports.EncountersService = EncountersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(encounter_entity_1.Encounter)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        event_emitter_1.EventEmitter2])
], EncountersService);
//# sourceMappingURL=encounters.service.js.map