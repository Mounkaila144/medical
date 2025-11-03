import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPractitionerFields1700000000002 implements MigrationInterface {
  name = 'AddPractitionerFields1700000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "practitioners" 
      ADD COLUMN "email" varchar,
      ADD COLUMN "phone_number" varchar,
      ADD COLUMN "slot_duration" integer DEFAULT 30
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "practitioners" 
      DROP COLUMN "email",
      DROP COLUMN "phone_number", 
      DROP COLUMN "slot_duration"
    `);
  }
}