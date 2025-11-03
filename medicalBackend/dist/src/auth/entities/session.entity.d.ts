import { User } from './user.entity';
export declare class Session {
    id: string;
    user: User;
    userId: string;
    refreshTokenHash: string;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
