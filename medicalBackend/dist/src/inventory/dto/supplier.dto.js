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
exports.UpdateSupplierInput = exports.CreateSupplierInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
let CreateSupplierInput = class CreateSupplierInput {
    name;
    contact;
};
exports.CreateSupplierInput = CreateSupplierInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSupplierInput.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateSupplierInput.prototype, "contact", void 0);
exports.CreateSupplierInput = CreateSupplierInput = __decorate([
    (0, graphql_1.InputType)()
], CreateSupplierInput);
let UpdateSupplierInput = class UpdateSupplierInput {
    name;
    contact;
};
exports.UpdateSupplierInput = UpdateSupplierInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSupplierInput.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateSupplierInput.prototype, "contact", void 0);
exports.UpdateSupplierInput = UpdateSupplierInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateSupplierInput);
//# sourceMappingURL=supplier.dto.js.map