import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
export declare class UsersService {
    private usersRepository;
    constructor(usersRepository: Repository<User>);
    findById(id: string): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    createByRole(createUserDto: CreateUserDto, createdById?: string): Promise<User>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<User>;
    deactivate(id: string): Promise<User>;
    reactivate(id: string): Promise<User>;
    findAllByTenant(tenantId: string): Promise<User[]>;
    findAllSuperadmins(): Promise<User[]>;
    findOnlySuperadmins(): Promise<User[]>;
}
