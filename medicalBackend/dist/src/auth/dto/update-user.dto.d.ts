import { AuthUserRole } from '../entities/user.entity';
export declare class UpdateUserDto {
    email?: string;
    password?: string;
    role?: AuthUserRole;
    firstName?: string;
    lastName?: string;
    isActive?: boolean;
}
