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
exports.UpdateItemInput = exports.CreateItemInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
const item_entity_1 = require("../entities/item.entity");
let CreateItemInput = class CreateItemInput {
    sku;
    name;
    category;
    unit;
    reorderLevel;
};
exports.CreateItemInput = CreateItemInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateItemInput.prototype, "sku", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateItemInput.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    (0, class_validator_1.IsEnum)(item_entity_1.ItemCategory),
    __metadata("design:type", String)
], CreateItemInput.prototype, "category", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    (0, class_validator_1.IsEnum)(item_entity_1.ItemUnit),
    __metadata("design:type", String)
], CreateItemInput.prototype, "unit", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateItemInput.prototype, "reorderLevel", void 0);
exports.CreateItemInput = CreateItemInput = __decorate([
    (0, graphql_1.InputType)()
], CreateItemInput);
let UpdateItemInput = class UpdateItemInput {
    name;
    category;
    unit;
    reorderLevel;
};
exports.UpdateItemInput = UpdateItemInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateItemInput.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsEnum)(item_entity_1.ItemCategory),
    __metadata("design:type", String)
], UpdateItemInput.prototype, "category", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsEnum)(item_entity_1.ItemUnit),
    __metadata("design:type", String)
], UpdateItemInput.prototype, "unit", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateItemInput.prototype, "reorderLevel", void 0);
exports.UpdateItemInput = UpdateItemInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateItemInput);
//# sourceMappingURL=item.dto.js.map