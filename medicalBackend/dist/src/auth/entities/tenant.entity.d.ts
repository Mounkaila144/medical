import { User } from './user.entity';
export declare class Tenant {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
    createdAt: Date;
    users: User[];
}
