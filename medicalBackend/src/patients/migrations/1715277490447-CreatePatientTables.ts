import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePatientTables1715277490447 implements MigrationInterface {
  name = 'CreatePatientTables1715277490447';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Création de l'énumération pour Gender
    await queryRunner.query(`CREATE TYPE "public"."patients_gender_enum" AS ENUM('M', 'F', 'O')`);

    // Création de la table patients
    await queryRunner.query(`
      CREATE TABLE "patients" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "clinic_id" uuid NOT NULL,
        "mrn" character varying NOT NULL,
        "first_name" character varying NOT NULL,
        "last_name" character varying NOT NULL,
        "dob" date NOT NULL,
        "gender" "public"."patients_gender_enum" NOT NULL,
        "blood_type" character varying,
        "phone" character varying,
        "email" character varying,
        "address" jsonb NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "UQ_patients_mrn" UNIQUE ("mrn"),
        CONSTRAINT "PK_patients" PRIMARY KEY ("id")
      )
    `);

    // Création de l'énumération pour MedicalHistoryType
    await queryRunner.query(`CREATE TYPE "public"."medical_history_items_type_enum" AS ENUM('ANTECEDENT', 'ALLERGY', 'VACCINE')`);

    // Création de la table medical_history_items
    await queryRunner.query(`
      CREATE TABLE "medical_history_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "patient_id" uuid NOT NULL,
        "type" "public"."medical_history_items_type_enum" NOT NULL,
        "label" character varying NOT NULL,
        "note" text NOT NULL,
        "recorded_at" TIMESTAMP NOT NULL,
        CONSTRAINT "PK_medical_history_items" PRIMARY KEY ("id")
      )
    `);

    // Création de l'énumération pour DocumentType
    await queryRunner.query(`CREATE TYPE "public"."scanned_documents_doc_type_enum" AS ENUM('ORDONNANCE', 'CR', 'RADIO')`);

    // Création de la table scanned_documents
    await queryRunner.query(`
      CREATE TABLE "scanned_documents" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "patient_id" uuid NOT NULL,
        "path" character varying NOT NULL,
        "doc_type" "public"."scanned_documents_doc_type_enum" NOT NULL,
        "tags" text array NOT NULL DEFAULT '{}',
        "uploaded_by" character varying NOT NULL,
        "uploaded_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_scanned_documents" PRIMARY KEY ("id")
      )
    `);

    // Ajout des clés étrangères
    await queryRunner.query(`
      ALTER TABLE "medical_history_items" 
      ADD CONSTRAINT "FK_medical_history_items_patient_id" 
      FOREIGN KEY ("patient_id") 
      REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "scanned_documents" 
      ADD CONSTRAINT "FK_scanned_documents_patient_id" 
      FOREIGN KEY ("patient_id") 
      REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // Ajout des index pour améliorer les performances
    await queryRunner.query(`CREATE INDEX "idx_patients_clinic_id" ON "patients" ("clinic_id")`);
    await queryRunner.query(`CREATE INDEX "idx_patients_mrn" ON "patients" ("mrn")`);
    await queryRunner.query(`CREATE INDEX "idx_patients_name" ON "patients" ("last_name", "first_name")`);
    await queryRunner.query(`CREATE INDEX "idx_medical_history_patient_id" ON "medical_history_items" ("patient_id")`);
    await queryRunner.query(`CREATE INDEX "idx_scanned_documents_patient_id" ON "scanned_documents" ("patient_id")`);

    // Row-Level Security pour la sécurité multi-tenant
    // Permet de s'assurer que les requêtes ne peuvent accéder qu'aux données de leur propre tenant (clinic_id)
    
    // Activer RLS sur la table patients
    await queryRunner.query(`
      ALTER TABLE "patients" ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY patients_tenant_isolation_policy ON "patients"
        USING (clinic_id = current_setting('app.current_tenant')::uuid);
    `);
    
    // Activer RLS sur la table medical_history_items (via la jointure avec patients)
    await queryRunner.query(`
      ALTER TABLE "medical_history_items" ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY medical_history_tenant_isolation_policy ON "medical_history_items"
        USING (patient_id IN (SELECT id FROM patients WHERE clinic_id = current_setting('app.current_tenant')::uuid));
    `);
    
    // Activer RLS sur la table scanned_documents (via la jointure avec patients)
    await queryRunner.query(`
      ALTER TABLE "scanned_documents" ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY documents_tenant_isolation_policy ON "scanned_documents"
        USING (patient_id IN (SELECT id FROM patients WHERE clinic_id = current_setting('app.current_tenant')::uuid));
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Supprimer les politiques RLS
    await queryRunner.query(`DROP POLICY IF EXISTS documents_tenant_isolation_policy ON "scanned_documents"`);
    await queryRunner.query(`DROP POLICY IF EXISTS medical_history_tenant_isolation_policy ON "medical_history_items"`);
    await queryRunner.query(`DROP POLICY IF EXISTS patients_tenant_isolation_policy ON "patients"`);
    
    // Désactiver RLS
    await queryRunner.query(`ALTER TABLE "scanned_documents" DISABLE ROW LEVEL SECURITY`);
    await queryRunner.query(`ALTER TABLE "medical_history_items" DISABLE ROW LEVEL SECURITY`);
    await queryRunner.query(`ALTER TABLE "patients" DISABLE ROW LEVEL SECURITY`);
    
    // Supprimer les index
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_scanned_documents_patient_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_medical_history_patient_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_patients_name"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_patients_mrn"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_patients_clinic_id"`);
    
    // Supprimer les clés étrangères
    await queryRunner.query(`ALTER TABLE "scanned_documents" DROP CONSTRAINT "FK_scanned_documents_patient_id"`);
    await queryRunner.query(`ALTER TABLE "medical_history_items" DROP CONSTRAINT "FK_medical_history_items_patient_id"`);
    
    // Supprimer les tables
    await queryRunner.query(`DROP TABLE "scanned_documents"`);
    await queryRunner.query(`DROP TYPE "public"."scanned_documents_doc_type_enum"`);
    await queryRunner.query(`DROP TABLE "medical_history_items"`);
    await queryRunner.query(`DROP TYPE "public"."medical_history_items_type_enum"`);
    await queryRunner.query(`DROP TABLE "patients"`);
    await queryRunner.query(`DROP TYPE "public"."patients_gender_enum"`);
  }
} 