import { Tenant } from './tenant.entity';
import { Session } from './session.entity';
export declare enum AuthUserRole {
    SUPERADMIN = "SUPERADMIN",
    CLINIC_ADMIN = "CLINIC_ADMIN",
    EMPLOYEE = "EMPLOYEE",
    PRACTITIONER = "PRACTITIONER"
}
export declare class User {
    id: string;
    tenant: Tenant;
    tenantId: string;
    email: string;
    passwordHash: string;
    role: AuthUserRole;
    firstName: string;
    lastName: string;
    isActive: boolean;
    lastLogin: Date;
    createdAt: Date;
    updatedAt: Date;
    sessions: Session[];
}
