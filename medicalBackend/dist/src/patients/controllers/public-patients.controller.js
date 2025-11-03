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
exports.PublicPatientsController = void 0;
const common_1 = require("@nestjs/common");
const patients_service_1 = require("../services/patients.service");
const create_patient_dto_1 = require("../dto/create-patient.dto");
const whatsapp_service_1 = require("../services/whatsapp.service");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const whatsapp_redirect_interceptor_1 = require("../../common/interceptors/whatsapp-redirect.interceptor");
let PublicPatientsController = class PublicPatientsController {
    patientsService;
    whatsappService;
    constructor(patientsService, whatsappService) {
        this.patientsService = patientsService;
        this.whatsappService = whatsappService;
    }
    async createAndRedirect(createPatientDto, tenantId, res) {
        createPatientDto.clinicId = tenantId;
        const patient = await this.patientsService.create(createPatientDto, tenantId);
        const whatsappUrl = this.whatsappService.generateWhatsappLink(patient);
        res.status(201).json({
            success: true,
            message: "Patient enregistré avec succès. Vous allez être redirigé vers WhatsApp.",
            redirectUrl: whatsappUrl
        });
    }
};
exports.PublicPatientsController = PublicPatientsController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)(':tenantId'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Param)('tenantId')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_patient_dto_1.CreatePatientDto, String, Object]),
    __metadata("design:returntype", Promise)
], PublicPatientsController.prototype, "createAndRedirect", null);
exports.PublicPatientsController = PublicPatientsController = __decorate([
    (0, common_1.Controller)('public/patients'),
    (0, common_1.UseInterceptors)(whatsapp_redirect_interceptor_1.WhatsappRedirectInterceptor),
    __metadata("design:paramtypes", [patients_service_1.PatientsService,
        whatsapp_service_1.WhatsappService])
], PublicPatientsController);
//# sourceMappingURL=public-patients.controller.js.map