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
exports.AdjustItemInput = exports.DispenseItemInput = exports.ReceiveItemInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
let ReceiveItemInput = class ReceiveItemInput {
    itemId;
    lotNumber;
    expiry;
    quantity;
    reference;
};
exports.ReceiveItemInput = ReceiveItemInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ReceiveItemInput.prototype, "itemId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReceiveItemInput.prototype, "lotNumber", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], ReceiveItemInput.prototype, "expiry", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ReceiveItemInput.prototype, "quantity", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ReceiveItemInput.prototype, "reference", void 0);
exports.ReceiveItemInput = ReceiveItemInput = __decorate([
    (0, graphql_1.InputType)()
], ReceiveItemInput);
let DispenseItemInput = class DispenseItemInput {
    itemId;
    quantity;
    reason;
    reference;
};
exports.DispenseItemInput = DispenseItemInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], DispenseItemInput.prototype, "itemId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], DispenseItemInput.prototype, "quantity", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DispenseItemInput.prototype, "reason", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], DispenseItemInput.prototype, "reference", void 0);
exports.DispenseItemInput = DispenseItemInput = __decorate([
    (0, graphql_1.InputType)()
], DispenseItemInput);
let AdjustItemInput = class AdjustItemInput {
    itemId;
    lotId;
    newQuantity;
    reason;
};
exports.AdjustItemInput = AdjustItemInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], AdjustItemInput.prototype, "itemId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], AdjustItemInput.prototype, "lotId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], AdjustItemInput.prototype, "newQuantity", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdjustItemInput.prototype, "reason", void 0);
exports.AdjustItemInput = AdjustItemInput = __decorate([
    (0, graphql_1.InputType)()
], AdjustItemInput);
//# sourceMappingURL=movement.dto.js.map