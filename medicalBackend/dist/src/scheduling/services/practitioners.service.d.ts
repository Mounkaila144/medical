import { Repository } from 'typeorm';
import { Practitioner } from '../entities/practitioner.entity';
import { Availability } from '../entities/availability.entity';
import { CreatePractitionerDto } from '../dto/create-practitioner.dto';
import { UsersService } from '../../auth/services/users.service';
export declare class PractitionersService {
    private practitionerRepository;
    private availabilityRepository;
    private usersService;
    private readonly logger;
    constructor(practitionerRepository: Repository<Practitioner>, availabilityRepository: Repository<Availability>, usersService: UsersService);
    create(tenantId: string, createPractitionerDto: CreatePractitionerDto): Promise<Practitioner>;
    private generateTemporaryPassword;
    findAll(tenantId: string): Promise<Practitioner[]>;
    findOne(tenantId: string, id: string): Promise<Practitioner>;
    update(tenantId: string, id: string, updateData: Partial<CreatePractitionerDto>): Promise<Practitioner>;
    delete(tenantId: string, id: string): Promise<void>;
    private mapDayOfWeekToNumber;
}
