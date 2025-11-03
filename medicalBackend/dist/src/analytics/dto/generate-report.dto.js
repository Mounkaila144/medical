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
exports.GenerateReportDto = exports.ReportType = void 0;
const class_validator_1 = require("class-validator");
const report_entity_1 = require("../entities/report.entity");
var ReportType;
(function (ReportType) {
    ReportType["DAILY_REVENUE"] = "DAILY_REVENUE";
    ReportType["PRACTITIONER_KPI"] = "PRACTITIONER_KPI";
    ReportType["OCCUPANCY_RATE"] = "OCCUPANCY_RATE";
    ReportType["CUSTOM"] = "CUSTOM";
})(ReportType || (exports.ReportType = ReportType = {}));
class GenerateReportDto {
    reportType;
    name;
    params;
    format;
}
exports.GenerateReportDto = GenerateReportDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(ReportType),
    __metadata("design:type", String)
], GenerateReportDto.prototype, "reportType", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateReportDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], GenerateReportDto.prototype, "params", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(report_entity_1.ReportFormat),
    __metadata("design:type", String)
], GenerateReportDto.prototype, "format", void 0);
//# sourceMappingURL=generate-report.dto.js.map