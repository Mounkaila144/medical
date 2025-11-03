import { Module, OnModuleInit, Controller, Post, Body, Req, Res } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { InjectRepository, getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

// Entités adaptées pour SQLite
import { Staff } from './mocks/entities/staff.entity';
import { Shift } from './mocks/entities/shift.entity';
import { LeaveRequest } from './mocks/entities/leave-request.entity';
import { Timesheet } from './mocks/entities/timesheet.entity';
import { PayrollExport } from './mocks/entities/payroll-export.entity';
import { Tenant } from './mocks/entities/tenant.entity';

// Services
import { StaffService } from '../../hr/services/staff.service';
import { ShiftService } from '../../hr/services/shift.service';
import { LeaveService } from '../../hr/services/leave.service';
import { TimesheetService } from '../../hr/services/timesheet.service';
import { PayrollService } from '../../hr/services/payroll.service';

// Resolvers
import { StaffResolver } from '../../hr/resolvers/staff.resolver';
import { ShiftResolver } from '../../hr/resolvers/shift.resolver';
import { LeaveResolver } from '../../hr/resolvers/leave.resolver';
import { TimesheetResolver } from '../../hr/resolvers/timesheet.resolver';
import { PayrollResolver } from '../../hr/resolvers/payroll.resolver';

// Guards
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

// Contrôleur Mock pour GraphQL
@Controller('graphql')
export class MockGraphQLController {
  constructor(
    private readonly leaveService: LeaveService,
    private readonly staffService: StaffService,
    private readonly payrollService: PayrollService,
    @InjectRepository(LeaveRequest) private leaveRequestRepository: Repository<LeaveRequest>,
    @InjectRepository(PayrollExport) private payrollExportRepository: Repository<PayrollExport>,
    @InjectRepository(Staff) private staffRepository: Repository<Staff>
  ) {}

  // Fonction utilitaire pour formater les dates
  formatDate(date: any): string {
    if (date instanceof Date) {
      return date.toISOString();
    } else if (typeof date === 'string') {
      return new Date(date).toISOString();
    }
    return new Date().toISOString();
  }

  // Fonction pour créer un fichier CSV d'export de paie
  async createPayrollCsvFile(tenantId: string, period: string): Promise<string> {
    // Créer le répertoire s'il n'existe pas
    const exportDir = path.join(process.cwd(), 'exports', 'payroll', tenantId);
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    // Créer le nom de fichier
    const fileName = `payroll_${period.replace('/', '-')}.csv`;
    const filePath = path.join(exportDir, fileName);
    const relativeFilePath = path.join('exports', 'payroll', tenantId, fileName);

    // Récupérer les membres du personnel pour ce tenant
    const staff = await this.staffRepository.find({ where: { tenantId } });

    // Créer le contenu du CSV
    const header = 'ID,Nom,Prénom,Rôle,Salaire\n';
    const rows = staff.map(s => `${s.id},${s.lastName},${s.firstName},${s.role},${s.salary}`).join('\n');
    const content = header + rows;

    // Écrire le fichier
    fs.writeFileSync(filePath, content);

    return relativeFilePath;
  }

  @Post()
  async handleGraphQL(@Body() body: any, @Req() req: any, @Res() res: any) {
    const query = body.query;
    let data = {};

    try {
      // Vérifier quelle opération est demandée et y répondre en conséquence
      if (query.includes('approveLeaveRequest')) {
        const matches = query.match(/id:\s*"([^"]+)"/);
        const id = matches ? matches[1] : null;
        
        const statusMatches = query.match(/status:\s*"([^"]+)"/);
        const status = statusMatches ? statusMatches[1] : null;
        
        const commentMatches = query.match(/comment:\s*"([^"]+)"/);
        const comment = commentMatches ? commentMatches[1] : null;
        
        if (id && status) {
          // Mettre à jour réellement la demande de congé dans la base de données
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
      } else if (query.includes('leaveRequestsByStaff')) {
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
      } else if (query.includes('generatePayrollCsv')) {
        const tenantMatches = query.match(/tenantId:\s*"([^"]+)"/);
        const tenantId = tenantMatches ? tenantMatches[1] : null;
        
        const periodMatches = query.match(/period:\s*"([^"]+)"/);
        const period = periodMatches ? periodMatches[1] : null;
        
        if (tenantId && period) {
          // Créer réellement le fichier CSV
          const filePath = await this.createPayrollCsvFile(tenantId, period);
          
          // Créer réellement un export de paie dans la base de données
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
      } else if (query.includes('payrollExportsByTenant')) {
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
    } catch (error) {
      console.error('Erreur lors du traitement de la requête GraphQL:', error);
      return res.status(500).json({ 
        errors: [{ message: error.message }],
        data: {} 
      });
    }
  }
}

// Stratégie JWT Mock pour les tests
@Injectable()
class MockJwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: 'test-access-secret-key',
    });
  }

  async validate(payload: any) {
    return { 
      userId: payload.id, 
      email: payload.email, 
      tenantId: payload.tenantId, 
      roles: payload.roles 
    };
  }
}

// Mock Guards pour tests
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

// Service d'initialisation de la base de données pour les tests
@Injectable()
class DatabaseInitService implements OnModuleInit {
  constructor(
    @InjectRepository(Tenant) private tenantRepository: Repository<Tenant>,
  ) {}

  async onModuleInit() {
    // Créer un tenant par défaut pour les tests
    const defaultTenant = {
      id: '00000000-0000-0000-0000-000000000000',
      name: 'Test Clinic',
      address: '123 Test St',
      active: true
    };

    try {
      // Vérifier si le tenant existe déjà
      const existingTenant = await this.tenantRepository.findOne({ 
        where: { id: defaultTenant.id } 
      });
      
      if (!existingTenant) {
        await this.tenantRepository.save(defaultTenant);
        console.log('Tenant par défaut créé pour les tests');
      }
    } catch (error) {
      console.error('Erreur lors de la création du tenant par défaut:', error);
    }
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'sqlite',
        database: ':memory:',
        entities: [
          Staff, 
          Shift, 
          LeaveRequest, 
          Timesheet, 
          PayrollExport,
          Tenant
        ],
        synchronize: true,
        logging: false,
        // Activer les contraintes de clés étrangères
        foreignKeys: true,
      }),
    }),
    TypeOrmModule.forFeature([
      Staff, 
      Shift, 
      LeaveRequest, 
      Timesheet, 
      PayrollExport,
      Tenant
    ]),
    EventEmitterModule.forRoot(),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_ACCESS_SECRET', 'test-access-secret-key'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  controllers: [
    MockGraphQLController
  ],
  providers: [
    StaffService,
    ShiftService,
    LeaveService,
    TimesheetService,
    PayrollService,
    StaffResolver,
    ShiftResolver,
    LeaveResolver,
    TimesheetResolver,
    PayrollResolver,
    MockJwtStrategy,
    DatabaseInitService,
    {
      provide: JwtAuthGuard,
      useClass: MockJwtAuthGuard,
    },
    {
      provide: GqlAuthGuard,
      useClass: MockGqlAuthGuard,
    },
    {
      provide: RolesGuard,
      useClass: MockRolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: MockJwtAuthGuard,
    },
  ],
  exports: [
    TypeOrmModule,
    StaffService,
    ShiftService,
    LeaveService,
    TimesheetService,
    PayrollService
  ]
})
export class HrTestModule {} 