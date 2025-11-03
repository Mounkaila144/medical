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
exports.WaitQueueEntry = exports.QueueStatus = exports.Priority = void 0;
const typeorm_1 = require("typeorm");
const graphql_1 = require("@nestjs/graphql");
var Priority;
(function (Priority) {
    Priority["LOW"] = "LOW";
    Priority["NORMAL"] = "NORMAL";
    Priority["HIGH"] = "HIGH";
    Priority["URGENT"] = "URGENT";
})(Priority || (exports.Priority = Priority = {}));
var QueueStatus;
(function (QueueStatus) {
    QueueStatus["WAITING"] = "WAITING";
    QueueStatus["CALLED"] = "CALLED";
    QueueStatus["SERVING"] = "SERVING";
    QueueStatus["COMPLETED"] = "COMPLETED";
    QueueStatus["CANCELLED"] = "CANCELLED";
})(QueueStatus || (exports.QueueStatus = QueueStatus = {}));
let WaitQueueEntry = class WaitQueueEntry {
    id;
    tenantId;
    patientId;
    practitionerId;
    priority;
    reason;
    rank;
    ticketNumber;
    status;
    calledAt;
    createdAt;
    servedAt;
};
exports.WaitQueueEntry = WaitQueueEntry;
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], WaitQueueEntry.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)({ name: 'tenant_id', type: 'uuid' }),
    __metadata("design:type", String)
], WaitQueueEntry.prototype, "tenantId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, typeorm_1.Column)({ name: 'patient_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], WaitQueueEntry.prototype, "patientId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, typeorm_1.Column)({ name: 'practitioner_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], WaitQueueEntry.prototype, "practitionerId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, typeorm_1.Column)({ type: 'enum', enum: Priority, nullable: true, default: Priority.NORMAL }),
    __metadata("design:type", String)
], WaitQueueEntry.prototype, "priority", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], WaitQueueEntry.prototype, "reason", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], WaitQueueEntry.prototype, "rank", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)({ name: 'ticket_number', type: 'varchar', unique: false }),
    __metadata("design:type", String)
], WaitQueueEntry.prototype, "ticketNumber", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, typeorm_1.Column)({ type: 'enum', enum: QueueStatus, default: QueueStatus.WAITING }),
    __metadata("design:type", String)
], WaitQueueEntry.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, typeorm_1.Column)({ name: 'called_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], WaitQueueEntry.prototype, "calledAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], WaitQueueEntry.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, typeorm_1.Column)({ name: 'served_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], WaitQueueEntry.prototype, "servedAt", void 0);
exports.WaitQueueEntry = WaitQueueEntry = __decorate([
    (0, graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)('wait_queue_entries')
], WaitQueueEntry);
//# sourceMappingURL=wait-queue-entry.entity.js.map