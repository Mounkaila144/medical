import { PractitionersService } from '../services/practitioners.service';
import { CreatePractitionerDto } from '../dto/create-practitioner.dto';
export declare class PractitionersController {
    private readonly practitionersService;
    constructor(practitionersService: PractitionersService);
    create(tenantId: string, createPractitionerDto: CreatePractitionerDto): Promise<import("../entities/practitioner.entity").Practitioner>;
    getAll(tenantId: string): Promise<import("../entities/practitioner.entity").Practitioner[]>;
    getOne(tenantId: string, id: string): Promise<import("../entities/practitioner.entity").Practitioner>;
    update(tenantId: string, id: string, updatePractitionerDto: Partial<CreatePractitionerDto>): Promise<import("../entities/practitioner.entity").Practitioner>;
    delete(tenantId: string, id: string): Promise<void>;
}
