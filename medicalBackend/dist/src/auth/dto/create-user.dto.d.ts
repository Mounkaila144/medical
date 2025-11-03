import { AuthUserRole } from '../entities/user.entity';
export declare class CreateUserDto {
    email: string;
    password: string;
    role: AuthUserRole;
    firstName: string;
    lastName: string;
    tenantId?: string;
}
