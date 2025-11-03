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
exports.CreateTenantDto = void 0;
const class_validator_1 = require("class-validator");
class CreateTenantDto {
    name;
    slug;
    adminEmail;
    adminPassword;
    adminFirstName;
    adminLastName;
}
exports.CreateTenantDto = CreateTenantDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'Le nom du tenant doit être une chaîne de caractères' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Le nom du tenant est requis' }),
    __metadata("design:type", String)
], CreateTenantDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Le slug du tenant doit être une chaîne de caractères' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Le slug du tenant est requis' }),
    __metadata("design:type", String)
], CreateTenantDto.prototype, "slug", void 0);
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: 'Veuillez entrer une adresse email valide pour l\'administrateur' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'L\'email de l\'administrateur est requis' }),
    __metadata("design:type", String)
], CreateTenantDto.prototype, "adminEmail", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Le mot de passe de l\'administrateur doit être une chaîne de caractères' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Le mot de passe de l\'administrateur est requis' }),
    (0, class_validator_1.MinLength)(8, { message: 'Le mot de passe de l\'administrateur doit contenir au moins 8 caractères' }),
    __metadata("design:type", String)
], CreateTenantDto.prototype, "adminPassword", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Le prénom de l\'administrateur doit être une chaîne de caractères' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Le prénom de l\'administrateur est requis' }),
    __metadata("design:type", String)
], CreateTenantDto.prototype, "adminFirstName", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Le nom de l\'administrateur doit être une chaîne de caractères' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Le nom de l\'administrateur est requis' }),
    __metadata("design:type", String)
], CreateTenantDto.prototype, "adminLastName", void 0);
//# sourceMappingURL=create-tenant.dto.js.map