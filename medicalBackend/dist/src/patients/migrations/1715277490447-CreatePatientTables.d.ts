import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class CreatePatientTables1715277490447 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
