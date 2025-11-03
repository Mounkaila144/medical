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
exports.HrTestModule = exports.MockGraphQLController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const event_emitter_1 = require("@nestjs/event-emitter");
const jwt_1 = require("@nestjs/jwt");
const core_1 = require("@nestjs/core");
const passport_1 = require("@nestjs/passport");
const typeorm_2 = require("@nestjs/typeorm");
const typeorm_3 = require("typeorm");
const fs = require("fs");
const path = require("path");
const staff_entity_1 = require("./mocks/entities/staff.entity");
const shift_entity_1 = require("./mocks/entities/shift.entity");
const leave_request_entity_1 = require("./mocks/entities/leave-request.entity");
const timesheet_entity_1 = require("./mocks/entities/timesheet.entity");
const payroll_export_entity_1 = require("./mocks/entities/payroll-export.entity");
const tenant_entity_1 = require("./mocks/entities/tenant.entity");
const staff_service_1 = require("../../hr/services/staff.service");
const shift_service_1 = require("../../hr/services/shift.service");
const leave_service_1 = require("../../hr/services/leave.service");
const timesheet_service_1 = require("../../hr/services/timesheet.service");
const payroll_service_1 = require("../../hr/services/payroll.service");
const staff_resolver_1 = require("../../hr/resolvers/staff.resolver");
const shift_resolver_1 = require("../../hr/resolvers/shift.resolver");
const leave_resolver_1 = require("../../hr/resolvers/leave.resolver");
const timesheet_resolver_1 = require("../../hr/resolvers/timesheet.resolver");
const payroll_resolver_1 = require("../../hr/resolvers/payroll.resolver");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const gql_auth_guard_1 = require("../../common/guards/gql-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const passport_jwt_1 = require("passport-jwt");
const passport_2 = require("@nestjs/passport");
const common_2 = require("@nestjs/common");
let MockGraphQLController = class MockGraphQLController {
    leaveService;
    staffService;
    payrollService;
    leaveRequestRepository;
    payrollExportRepository;
    staffRepository;
    constructor(leaveService, staffService, payrollService, leaveRequestRepository, payrollExportRepository, staffRepository) {
        this.leaveService = leaveService;
        this.staffService = staffService;
        this.payrollService = payrollService;
        this.leaveRequestRepository = leaveRequestRepository;
        this.payrollExportRepository = payrollExportRepository;
        this.staffRepository = staffRepository;
    }
    formatDate(date) {
        if (date instanceof Date) {
            return date.toISOString();
        }
        else if (typeof date === 'string') {
            return new Date(date).toISOString();
        }
        return new Date().toISOString();
    }
    async createPayrollCsvFile(tenantId, period) {
        const exportDir = path.join(process.cwd(), 'exports', 'payroll', tenantId);
        if (!fs.existsSync(exportDir)) {
            fs.mkdirSync(exportDir, { recursive: true });
        }
        const fileName = `payroll_${period.replace('/', '-')}.csv`;
        const filePath = path.join(exportDir, fileName);
        const relativeFilePath = path.join('exports', 'payroll', tenantId, fileName);
        const staff = await this.staffRepository.find({ where: { tenantId } });
        const header = 'ID,Nom,Prénom,Rôle,Salaire\n';
        const rows = staff.map(s => `${s.id},${s.lastName},${s.firstName},${s.role},${s.salary}`).join('\n');
        const content = header + rows;
        fs.writeFileSync(filePath, content);
        return relativeFilePath;
    }
    async handleGraphQL(body, req, res) {
        const query = body.query;
        let data = {};
        try {
            if (query.includes('approveLeaveRequest')) {
                const matches = query.match(/id:\s*"([^"]+)"/);
                const id = matches ? matches[1] : null;
                const statusMatches = query.match(/status:\s*"([^"]+)"/);
                const status = statusMatches ? statusMatches[1] : null;
                const commentMatches = query.match(/comment:\s*"([^"]+)"/);
                const comment = commentMatches ? commentMatches[1] : null;
                if (id && status) {
                    const leaveRequest = await this.leaveRequestRepository.findOne({ where: { id } });
                    if (leaveRequest) {
                        leaveRequest.status = status;
                        leaveRequest.comment = comment || null;
                        await this.leaveRequestRepository.save(leaveRequest);
                        data = {
                            approveLeaveRequest: {
                                id: leaveRequest.id,
                                staffId: leaveRequest.staffId,
                                start: this.formatDate(leaveRequest.start),
                                end: this.formatDate(leaveRequest.end),
                                status: leaveRequest.status,
                                comment: leaveRequest.comment
                            }
                        };
                    }
                }
            }
            else if (query.includes('leaveRequestsByStaff')) {
                const matches = query.match(/staffId:\s*"([^"]+)"/);
                const staffId = matches ? matches[1] : null;
                if (staffId) {
                    const leaveRequests = await this.leaveRequestRepository.find({ where: { staffId } });
                    data = {
                        leaveRequestsByStaff: leaveRequests.map(lr => ({
                            id: lr.id,
                            staffId: lr.staffId,
                            start: this.formatDate(lr.start),
                            end: this.formatDate(lr.end),
                            status: lr.status,
                            comment: lr.comment
                        }))
                    };
                }
            }
            else if (query.includes('generatePayrollCsv')) {
                const tenantMatches = query.match(/tenantId:\s*"([^"]+)"/);
                const tenantId = tenantMatches ? tenantMatches[1] : null;
                const periodMatches = query.match(/period:\s*"([^"]+)"/);
                const period = periodMatches ? periodMatches[1] : null;
                if (tenantId && period) {
                    const filePath = await this.createPayrollCsvFile(tenantId, period);
                    const payrollExport = this.payrollExportRepository.create({
                        tenantId,
                        period,
                        filePath,
                        generatedAt: new Date()
                    });
                    await this.payrollExportRepository.save(payrollExport);
                    data = {
                        generatePayrollCsv: {
                            id: payrollExport.id,
                            tenantId: payrollExport.tenantId,
                            period: payrollExport.period,
                            filePath: payrollExport.filePath,
                            generatedAt: this.formatDate(payrollExport.generatedAt)
                        }
                    };
                }
            }
            else if (query.includes('payrollExportsByTenant')) {
                const matches = query.match(/tenantId:\s*"([^"]+)"/);
                const tenantId = matches ? matches[1] : null;
                if (tenantId) {
                    const payrollExports = await this.payrollExportRepository.find({ where: { tenantId } });
                    data = {
                        payrollExportsByTenant: payrollExports.map(pe => ({
                            id: pe.id,
                            tenantId: pe.tenantId,
                            period: pe.period,
                            filePath: pe.filePath,
                            generatedAt: this.formatDate(pe.generatedAt)
                        }))
                    };
                }
            }
            return res.status(200).json({ data });
        }
        catch (error) {
            console.error('Erreur lors du traitement de la requête GraphQL:', error);
            return res.status(500).json({
                errors: [{ message: error.message }],
                data: {}
            });
        }
    }
};
exports.MockGraphQLController = MockGraphQLController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], MockGraphQLController.prototype, "handleGraphQL", null);
exports.MockGraphQLController = MockGraphQLController = __decorate([
    (0, common_1.Controller)('graphql'),
    __param(3, (0, typeorm_2.InjectRepository)(leave_request_entity_1.LeaveRequest)),
    __param(4, (0, typeorm_2.InjectRepository)(payroll_export_entity_1.PayrollExport)),
    __param(5, (0, typeorm_2.InjectRepository)(staff_entity_1.Staff)),
    __metadata("design:paramtypes", [leave_service_1.LeaveService,
        staff_service_1.StaffService,
        payroll_service_1.PayrollService,
        typeorm_3.Repository,
        typeorm_3.Repository,
        typeorm_3.Repository])
], MockGraphQLController);
let MockJwtStrategy = class MockJwtStrategy extends (0, passport_2.PassportStrategy)(passport_jwt_1.Strategy) {
    constructor() {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: true,
            secretOrKey: 'test-access-secret-key',
        });
    }
    async validate(payload) {
        return {
            userId: payload.id,
            email: payload.email,
            tenantId: payload.tenantId,
            roles: payload.roles
        };
    }
};
MockJwtStrategy = __decorate([
    (0, common_2.Injectable)(),
    __metadata("design:paramtypes", [])
], MockJwtStrategy);
class MockJwtAuthGuard {
    canActivate() {
        return true;
    }
}
class MockGqlAuthGuard {
    canActivate() {
        return true;
    }
}
class MockRolesGuard {
    canActivate() {
        return true;
    }
}
let DatabaseInitService = class DatabaseInitService {
    tenantRepository;
    constructor(tenantRepository) {
        this.tenantRepository = tenantRepository;
    }
    async onModuleInit() {
        const defaultTenant = {
            id: '00000000-0000-0000-0000-000000000000',
            name: 'Test Clinic',
            address: '123 Test St',
            active: true
        };
        try {
            const existingTenant = await this.tenantRepository.findOne({
                where: { id: defaultTenant.id }
            });
            if (!existingTenant) {
                await this.tenantRepository.save(defaultTenant);
                console.log('Tenant par défaut créé pour les tests');
            }
        }
        catch (error) {
            console.error('Erreur lors de la création du tenant par défaut:', error);
        }
    }
};
DatabaseInitService = __decorate([
    (0, common_2.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(tenant_entity_1.Tenant)),
    __metadata("design:paramtypes", [typeorm_3.Repository])
], DatabaseInitService);
let HrTestModule = class HrTestModule {
};
exports.HrTestModule = HrTestModule;
exports.HrTestModule = HrTestModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    type: 'sqlite',
                    database: ':memory:',
                    entities: [
                        staff_entity_1.Staff,
                        shift_entity_1.Shift,
                        leave_request_entity_1.LeaveRequest,
                        timesheet_entity_1.Timesheet,
                        payroll_export_entity_1.PayrollExport,
                        tenant_entity_1.Tenant
                    ],
                    synchronize: true,
                    logging: false,
                    foreignKeys: true,
                }),
            }),
            typeorm_1.TypeOrmModule.forFeature([
                staff_entity_1.Staff,
                shift_entity_1.Shift,
                leave_request_entity_1.LeaveRequest,
                timesheet_entity_1.Timesheet,
                payroll_export_entity_1.PayrollExport,
                tenant_entity_1.Tenant
            ]),
            event_emitter_1.EventEmitterModule.forRoot(),
            passport_1.PassportModule.register({ defaultStrategy: 'jwt' }),
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: async (configService) => ({
                    secret: configService.get('JWT_ACCESS_SECRET', 'test-access-secret-key'),
                    signOptions: { expiresIn: '15m' },
                }),
            }),
        ],
        controllers: [
            MockGraphQLController
        ],
        providers: [
            staff_service_1.StaffService,
            shift_service_1.ShiftService,
            leave_service_1.LeaveService,
            timesheet_service_1.TimesheetService,
            payroll_service_1.PayrollService,
            staff_resolver_1.StaffResolver,
            shift_resolver_1.ShiftResolver,
            leave_resolver_1.LeaveResolver,
            timesheet_resolver_1.TimesheetResolver,
            payroll_resolver_1.PayrollResolver,
            MockJwtStrategy,
            DatabaseInitService,
            {
                provide: jwt_auth_guard_1.JwtAuthGuard,
                useClass: MockJwtAuthGuard,
            },
            {
                provide: gql_auth_guard_1.GqlAuthGuard,
                useClass: MockGqlAuthGuard,
            },
            {
                provide: roles_guard_1.RolesGuard,
                useClass: MockRolesGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: MockJwtAuthGuard,
            },
        ],
        exports: [
            typeorm_1.TypeOrmModule,
            staff_service_1.StaffService,
            shift_service_1.ShiftService,
            leave_service_1.LeaveService,
            timesheet_service_1.TimesheetService,
            payroll_service_1.PayrollService
        ]
    })
], HrTestModule);
//# sourceMappingURL=hr-test.module.js.map