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
exports.Movement = exports.MovementType = void 0;
const typeorm_1 = require("typeorm");
const graphql_1 = require("@nestjs/graphql");
const item_entity_1 = require("./item.entity");
var MovementType;
(function (MovementType) {
    MovementType["IN"] = "IN";
    MovementType["OUT"] = "OUT";
    MovementType["ADJUST"] = "ADJUST";
})(MovementType || (exports.MovementType = MovementType = {}));
(0, graphql_1.registerEnumType)(MovementType, {
    name: 'MovementType',
});
let Movement = class Movement {
    id;
    item;
    type;
    qty;
    reason;
    reference;
    movedAt;
};
exports.Movement = Movement;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Movement.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => item_entity_1.Item),
    (0, typeorm_1.ManyToOne)(() => item_entity_1.Item, item => item.movements, { nullable: false }),
    __metadata("design:type", item_entity_1.Item)
], Movement.prototype, "item", void 0);
__decorate([
    (0, graphql_1.Field)(() => MovementType),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: MovementType,
    }),
    __metadata("design:type", String)
], Movement.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)(() => Number),
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Movement.prototype, "qty", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Movement.prototype, "reason", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Movement.prototype, "reference", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], Movement.prototype, "movedAt", void 0);
exports.Movement = Movement = __decorate([
    (0, graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)()
], Movement);
//# sourceMappingURL=movement.entity.js.map