import { Repository } from 'typeorm';
import { Practitioner } from '../../scheduling/entities/practitioner.entity';
import { User } from '../entities/user.entity';
export declare class PractitionerAuthService {
    private practitionerRepository;
    private userRepository;
    constructor(practitionerRepository: Repository<Practitioner>, userRepository: Repository<User>);
    validatePractitioner(userId: string): Promise<Practitioner | null>;
    getPractitionerByUserId(userId: string): Promise<Practitioner>;
    linkUserToPractitioner(userId: string, practitionerId: string): Promise<Practitioner>;
    getAllPractitionersWithUsers(tenantId: string): Promise<Practitioner[]>;
}
