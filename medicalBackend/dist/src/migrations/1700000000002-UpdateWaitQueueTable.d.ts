import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class UpdateWaitQueueTable1700000000002 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
