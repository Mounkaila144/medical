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
exports.Availability = void 0;
const typeorm_1 = require("typeorm");
const graphql_1 = require("@nestjs/graphql");
const practitioner_entity_1 = require("./practitioner.entity");
const repeat_type_enum_1 = require("../enums/repeat-type.enum");
let Availability = class Availability {
    id;
    practitionerId;
    weekday;
    start;
    end;
    repeat;
    practitioner;
};
exports.Availability = Availability;
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Availability.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)({ name: 'practitioner_id', type: 'uuid' }),
    __metadata("design:type", String)
], Availability.prototype, "practitionerId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Availability.prototype, "weekday", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)({ type: 'time' }),
    __metadata("design:type", String)
], Availability.prototype, "start", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)({ type: 'time' }),
    __metadata("design:type", String)
], Availability.prototype, "end", void 0);
__decorate([
    (0, graphql_1.Field)(() => repeat_type_enum_1.RepeatType),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: repeat_type_enum_1.RepeatType,
        default: repeat_type_enum_1.RepeatType.WEEKLY,
    }),
    __metadata("design:type", String)
], Availability.prototype, "repeat", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => practitioner_entity_1.Practitioner, (practitioner) => practitioner.availabilities),
    (0, typeorm_1.JoinColumn)({ name: 'practitioner_id' }),
    __metadata("design:type", practitioner_entity_1.Practitioner)
], Availability.prototype, "practitioner", void 0);
exports.Availability = Availability = __decorate([
    (0, graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)('availabilities')
], Availability);
//# sourceMappingURL=availability.entity.js.map