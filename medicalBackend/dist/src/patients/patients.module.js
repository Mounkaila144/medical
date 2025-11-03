"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const microservices_1 = require("@nestjs/microservices");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const patient_entity_1 = require("./entities/patient.entity");
const medical_history_item_entity_1 = require("./entities/medical-history-item.entity");
const scanned_document_entity_1 = require("./entities/scanned-document.entity");
const patients_service_1 = require("./services/patients.service");
const medical_history_service_1 = require("./services/medical-history.service");
const documents_service_1 = require("./services/documents.service");
const whatsapp_service_1 = require("./services/whatsapp.service");
const patients_controller_1 = require("./controllers/patients.controller");
const medical_history_controller_1 = require("./controllers/medical-history.controller");
const documents_controller_1 = require("./controllers/documents.controller");
const public_patients_controller_1 = require("./controllers/public-patients.controller");
const patients_resolver_1 = require("./resolvers/patients.resolver");
const medical_history_resolver_1 = require("./resolvers/medical-history.resolver");
const documents_resolver_1 = require("./resolvers/documents.resolver");
const auth_module_1 = require("../auth/auth.module");
let PatientsModule = class PatientsModule {
};
exports.PatientsModule = PatientsModule;
exports.PatientsModule = PatientsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([patient_entity_1.Patient, medical_history_item_entity_1.MedicalHistoryItem, scanned_document_entity_1.ScannedDocument]),
            platform_express_1.MulterModule.register({
                storage: (0, multer_1.memoryStorage)(),
                limits: {
                    fileSize: 10 * 1024 * 1024,
                },
            }),
            microservices_1.ClientsModule.register([
                {
                    name: 'RABBITMQ_SERVICE',
                    transport: microservices_1.Transport.RMQ,
                    options: {
                        urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
                        queue: 'patients_queue',
                        queueOptions: {
                            durable: true,
                        },
                    },
                },
            ]),
            auth_module_1.AuthModule,
        ],
        controllers: [
            patients_controller_1.PatientsController,
            medical_history_controller_1.MedicalHistoryController,
            documents_controller_1.DocumentsController,
            public_patients_controller_1.PublicPatientsController,
        ],
        providers: [
            patients_service_1.PatientsService,
            medical_history_service_1.MedicalHistoryService,
            documents_service_1.DocumentsService,
            whatsapp_service_1.WhatsappService,
            patients_resolver_1.PatientsResolver,
            medical_history_resolver_1.MedicalHistoryResolver,
            documents_resolver_1.DocumentsResolver,
        ],
        exports: [patients_service_1.PatientsService, medical_history_service_1.MedicalHistoryService, documents_service_1.DocumentsService],
    })
], PatientsModule);
//# sourceMappingURL=patients.module.js.map