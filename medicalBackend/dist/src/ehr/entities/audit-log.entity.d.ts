import { User } from '../../auth/entities/user.entity';
export declare class AuditLog {
    id: string;
    tenantId: string;
    user: User;
    userId: string;
    table: string;
    column: string;
    before: Record<string, any>;
    after: Record<string, any>;
    changedAt: Date;
    details: any;
    changes: any;
}
