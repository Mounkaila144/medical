import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSchedulingTables1700000000001 implements MigrationInterface {
  name = 'CreateSchedulingTables1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Créer les types d'énumération
    await queryRunner.query(`
      CREATE TYPE "public"."appointment_status_enum" AS ENUM(
        'BOOKED', 'CANCELLED', 'DONE', 'NO_SHOW'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."repeat_type_enum" AS ENUM(
        'WEEKLY', 'DAILY'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."urgency_level_enum" AS ENUM(
        'ROUTINE', 'URGENT'
      )
    `);

    // Créer la table des praticiens
    await queryRunner.query(`
      CREATE TABLE "practitioners" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenant_id" uuid NOT NULL,
        "first_name" character varying NOT NULL,
        "last_name" character varying NOT NULL,
        "specialty" character varying NOT NULL,
        "color" character varying NOT NULL,
        CONSTRAINT "PK_practitioners" PRIMARY KEY ("id")
      )
    `);

    // Créer la table des disponibilités
    await queryRunner.query(`
      CREATE TABLE "availabilities" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "practitioner_id" uuid NOT NULL,
        "weekday" integer NOT NULL,
        "start" TIME NOT NULL,
        "end" TIME NOT NULL,
        "repeat" "public"."repeat_type_enum" NOT NULL DEFAULT 'WEEKLY',
        CONSTRAINT "PK_availabilities" PRIMARY KEY ("id")
      )
    `);

    // Créer la table des rendez-vous
    await queryRunner.query(`
      CREATE TABLE "appointments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenant_id" uuid NOT NULL,
        "patient_id" uuid NOT NULL,
        "practitioner_id" uuid NOT NULL,
        "status" "public"."appointment_status_enum" NOT NULL DEFAULT 'BOOKED',
        "start_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "end_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "room" character varying,
        "reason" character varying,
        "urgency" "public"."urgency_level_enum" NOT NULL DEFAULT 'ROUTINE',
        CONSTRAINT "PK_appointments" PRIMARY KEY ("id")
      )
    `);

    // Créer la table de la file d'attente
    await queryRunner.query(`
      CREATE TABLE "wait_queue_entries" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenant_id" uuid NOT NULL,
        "patient_id" uuid NOT NULL,
        "rank" integer NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "served_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_wait_queue_entries" PRIMARY KEY ("id")
      )
    `);

    // Ajouter les clés étrangères
    await queryRunner.query(`
      ALTER TABLE "availabilities" 
      ADD CONSTRAINT "FK_availabilities_practitioners" 
      FOREIGN KEY ("practitioner_id") 
      REFERENCES "practitioners"("id") 
      ON DELETE CASCADE 
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "appointments" 
      ADD CONSTRAINT "FK_appointments_practitioners" 
      FOREIGN KEY ("practitioner_id") 
      REFERENCES "practitioners"("id") 
      ON DELETE RESTRICT 
      ON UPDATE NO ACTION
    `);

    // Ajouter les index
    await queryRunner.query(`CREATE INDEX "IDX_practitioners_tenant" ON "practitioners" ("tenant_id") `);
    await queryRunner.query(`CREATE INDEX "IDX_availabilities_practitioner" ON "availabilities" ("practitioner_id") `);
    await queryRunner.query(`CREATE INDEX "IDX_appointments_tenant" ON "appointments" ("tenant_id") `);
    await queryRunner.query(`CREATE INDEX "IDX_appointments_patient" ON "appointments" ("patient_id") `);
    await queryRunner.query(`CREATE INDEX "IDX_appointments_practitioner" ON "appointments" ("practitioner_id") `);
    await queryRunner.query(`CREATE INDEX "IDX_appointments_status" ON "appointments" ("status") `);
    await queryRunner.query(`CREATE INDEX "IDX_appointments_start_end" ON "appointments" ("start_at", "end_at") `);
    await queryRunner.query(`CREATE INDEX "IDX_wait_queue_tenant" ON "wait_queue_entries" ("tenant_id") `);
    await queryRunner.query(`CREATE INDEX "IDX_wait_queue_patient" ON "wait_queue_entries" ("patient_id") `);
    await queryRunner.query(`CREATE INDEX "IDX_wait_queue_rank" ON "wait_queue_entries" ("rank") `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Supprimer les index
    await queryRunner.query(`DROP INDEX "IDX_wait_queue_rank"`);
    await queryRunner.query(`DROP INDEX "IDX_wait_queue_patient"`);
    await queryRunner.query(`DROP INDEX "IDX_wait_queue_tenant"`);
    await queryRunner.query(`DROP INDEX "IDX_appointments_start_end"`);
    await queryRunner.query(`DROP INDEX "IDX_appointments_status"`);
    await queryRunner.query(`DROP INDEX "IDX_appointments_practitioner"`);
    await queryRunner.query(`DROP INDEX "IDX_appointments_patient"`);
    await queryRunner.query(`DROP INDEX "IDX_appointments_tenant"`);
    await queryRunner.query(`DROP INDEX "IDX_availabilities_practitioner"`);
    await queryRunner.query(`DROP INDEX "IDX_practitioners_tenant"`);

    // Supprimer les clés étrangères
    await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_appointments_practitioners"`);
    await queryRunner.query(`ALTER TABLE "availabilities" DROP CONSTRAINT "FK_availabilities_practitioners"`);

    // Supprimer les tables
    await queryRunner.query(`DROP TABLE "wait_queue_entries"`);
    await queryRunner.query(`DROP TABLE "appointments"`);
    await queryRunner.query(`DROP TABLE "availabilities"`);
    await queryRunner.query(`DROP TABLE "practitioners"`);

    // Supprimer les types d'énumération
    await queryRunner.query(`DROP TYPE "public"."urgency_level_enum"`);
    await queryRunner.query(`DROP TYPE "public"."repeat_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."appointment_status_enum"`);
  }
} 