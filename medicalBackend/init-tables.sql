-- Script d'initialisation de la base de données médicale
-- Créer l'extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Supprimer les tables existantes si elles existent (pour un redémarrage propre)
DROP TABLE IF EXISTS "sessions" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;
DROP TABLE IF EXISTS "tenants" CASCADE;
DROP TABLE IF EXISTS "scanned_documents" CASCADE;
DROP TABLE IF EXISTS "medical_history_items" CASCADE;
DROP TABLE IF EXISTS "patients" CASCADE;
DROP TABLE IF EXISTS "wait_queue_entries" CASCADE;
DROP TABLE IF EXISTS "appointments" CASCADE;
DROP TABLE IF EXISTS "availabilities" CASCADE;
DROP TABLE IF EXISTS "practitioners" CASCADE;

-- Supprimer les types enum s'ils existent
DROP TYPE IF EXISTS "public"."users_role_enum" CASCADE;
DROP TYPE IF EXISTS "public"."appointment_status_enum" CASCADE;
DROP TYPE IF EXISTS "public"."repeat_type_enum" CASCADE;
DROP TYPE IF EXISTS "public"."urgency_level_enum" CASCADE;
DROP TYPE IF EXISTS "public"."priority_enum" CASCADE;
DROP TYPE IF EXISTS "public"."patients_gender_enum" CASCADE;
DROP TYPE IF EXISTS "public"."medical_history_items_type_enum" CASCADE;
DROP TYPE IF EXISTS "public"."scanned_documents_doc_type_enum" CASCADE;

-- Créer les types enum
CREATE TYPE "public"."users_role_enum" AS ENUM('SUPERADMIN', 'CLINIC_ADMIN', 'EMPLOYEE', 'PRACTITIONER');
CREATE TYPE "public"."appointment_status_enum" AS ENUM('BOOKED', 'CANCELLED', 'DONE', 'NO_SHOW');
CREATE TYPE "public"."repeat_type_enum" AS ENUM('WEEKLY', 'DAILY');
CREATE TYPE "public"."urgency_level_enum" AS ENUM('ROUTINE', 'URGENT');
CREATE TYPE "public"."priority_enum" AS ENUM('LOW', 'NORMAL', 'HIGH', 'URGENT');
CREATE TYPE "public"."patients_gender_enum" AS ENUM('M', 'F', 'O');
CREATE TYPE "public"."medical_history_items_type_enum" AS ENUM('ANTECEDENT', 'ALLERGY', 'VACCINE');
CREATE TYPE "public"."scanned_documents_doc_type_enum" AS ENUM('ORDONNANCE', 'CR', 'RADIO');

-- Créer la table des tenants
CREATE TABLE "tenants" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "name" character varying(255) NOT NULL,
  "slug" character varying(255) NOT NULL,
  "isActive" boolean NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "UQ_tenants_slug" UNIQUE ("slug"),
  CONSTRAINT "PK_tenants" PRIMARY KEY ("id")
);

-- Créer la table des utilisateurs
CREATE TABLE "users" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "tenantId" uuid,
  "email" character varying(255) NOT NULL,
  "passwordHash" character varying(255) NOT NULL,
  "role" "public"."users_role_enum" NOT NULL,
  "firstName" character varying(100) NOT NULL,
  "lastName" character varying(100) NOT NULL,
  "isActive" boolean NOT NULL DEFAULT true,
  "lastLogin" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "UQ_users_email" UNIQUE ("email"),
  CONSTRAINT "PK_users" PRIMARY KEY ("id")
);

-- Créer la table des sessions
CREATE TABLE "sessions" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "userId" uuid NOT NULL,
  "refreshTokenHash" character varying(255) NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_sessions" PRIMARY KEY ("id")
);

-- Créer la table des praticiens
CREATE TABLE "practitioners" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" uuid NOT NULL,
  "user_id" uuid,
  "first_name" character varying NOT NULL,
  "last_name" character varying NOT NULL,
  "specialty" character varying NOT NULL,
  "color" character varying NOT NULL,
  CONSTRAINT "PK_practitioners" PRIMARY KEY ("id")
);

-- Créer la table des disponibilités
CREATE TABLE "availabilities" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "practitioner_id" uuid NOT NULL,
  "weekday" integer NOT NULL,
  "start" TIME NOT NULL,
  "end" TIME NOT NULL,
  "repeat" "public"."repeat_type_enum" NOT NULL DEFAULT 'WEEKLY',
  CONSTRAINT "PK_availabilities" PRIMARY KEY ("id")
);

-- Créer la table des rendez-vous
CREATE TABLE "appointments" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" uuid NOT NULL,
  "patient_id" uuid NOT NULL,
  "practitioner_id" uuid NOT NULL,
  "start_at" TIMESTAMP NOT NULL,
  "end_at" TIMESTAMP NOT NULL,
  "status" "public"."appointment_status_enum" NOT NULL DEFAULT 'BOOKED',
  "urgency" "public"."urgency_level_enum" NOT NULL DEFAULT 'ROUTINE',
  "notes" text,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_appointments" PRIMARY KEY ("id")
);

-- Créer la table de file d'attente
CREATE TABLE "wait_queue_entries" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" uuid NOT NULL,
  "patient_id" uuid NOT NULL,
  "practitioner_id" uuid,
  "rank" integer NOT NULL,
  "priority" "public"."priority_enum" DEFAULT 'NORMAL',
  "reason" text,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_wait_queue_entries" PRIMARY KEY ("id")
);

-- Créer la table des patients
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
);

-- Créer la table de l'historique médical
CREATE TABLE "medical_history_items" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "patient_id" uuid NOT NULL,
  "type" "public"."medical_history_items_type_enum" NOT NULL,
  "label" character varying NOT NULL,
  "note" text NOT NULL,
  "recorded_at" TIMESTAMP NOT NULL,
  CONSTRAINT "PK_medical_history_items" PRIMARY KEY ("id")
);

-- Créer la table des documents scannés
CREATE TABLE "scanned_documents" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "patient_id" uuid NOT NULL,
  "path" character varying NOT NULL,
  "doc_type" "public"."scanned_documents_doc_type_enum" NOT NULL,
  "tags" text array NOT NULL DEFAULT '{}',
  "uploaded_by" character varying NOT NULL,
  "uploaded_at" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_scanned_documents" PRIMARY KEY ("id")
);

-- Ajouter les contraintes de clés étrangères
ALTER TABLE "users" ADD CONSTRAINT "FK_users_tenantId" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "sessions" ADD CONSTRAINT "FK_sessions_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "practitioners" ADD CONSTRAINT "FK_practitioners_tenant_id" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "practitioners" ADD CONSTRAINT "FK_practitioners_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "availabilities" ADD CONSTRAINT "FK_availabilities_practitioner_id" FOREIGN KEY ("practitioner_id") REFERENCES "practitioners"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "medical_history_items" ADD CONSTRAINT "FK_medical_history_items_patient_id" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "scanned_documents" ADD CONSTRAINT "FK_scanned_documents_patient_id" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- Créer les index
CREATE INDEX "IDX_practitioners_tenant" ON "practitioners" ("tenant_id");
CREATE INDEX "IDX_practitioners_user" ON "practitioners" ("user_id");
CREATE INDEX "IDX_availabilities_practitioner" ON "availabilities" ("practitioner_id");
CREATE INDEX "IDX_appointments_tenant" ON "appointments" ("tenant_id");
CREATE INDEX "IDX_appointments_patient" ON "appointments" ("patient_id");
CREATE INDEX "IDX_appointments_practitioner" ON "appointments" ("practitioner_id");
CREATE INDEX "IDX_appointments_status" ON "appointments" ("status");
CREATE INDEX "IDX_appointments_start_end" ON "appointments" ("start_at", "end_at");
CREATE INDEX "IDX_wait_queue_tenant" ON "wait_queue_entries" ("tenant_id");
CREATE INDEX "IDX_wait_queue_patient" ON "wait_queue_entries" ("patient_id");
CREATE INDEX "IDX_wait_queue_rank" ON "wait_queue_entries" ("rank");
CREATE INDEX "idx_patients_clinic_id" ON "patients" ("clinic_id");
CREATE INDEX "idx_patients_mrn" ON "patients" ("mrn");
CREATE INDEX "idx_patients_name" ON "patients" ("last_name", "first_name");
CREATE INDEX "idx_medical_history_patient_id" ON "medical_history_items" ("patient_id");
CREATE INDEX "idx_scanned_documents_patient_id" ON "scanned_documents" ("patient_id");
CREATE UNIQUE INDEX "IDX_practitioners_user_id" ON "practitioners" ("user_id") WHERE "user_id" IS NOT NULL;

-- Insérer des données de test
-- Insérer un tenant de test
INSERT INTO "tenants" ("id", "name", "slug", "isActive", "createdAt") 
VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d479', 
  'Clinique Exemple', 
  'clinique-exemple', 
  true, 
  now()
);

-- Insérer un utilisateur admin de test
-- Mot de passe: password123 (hashé avec bcrypt)
INSERT INTO "users" ("id", "tenantId", "email", "passwordHash", "role", "firstName", "lastName", "isActive", "createdAt", "updatedAt") 
VALUES (
  'a47ac10b-58cc-4372-a567-0e02b2c3d480', 
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'admin@clinique-exemple.com', 
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
  'CLINIC_ADMIN', 
  'Admin', 
  'Clinique', 
  true, 
  now(), 
  now()
);

-- Insérer un utilisateur employé de test
INSERT INTO "users" ("id", "tenantId", "email", "passwordHash", "role", "firstName", "lastName", "isActive", "createdAt", "updatedAt") 
VALUES (
  'b47ac10b-58cc-4372-a567-0e02b2c3d481', 
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'employee@clinique-exemple.com', 
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
  'EMPLOYEE', 
  'Employé', 
  'Test', 
  true, 
  now(), 
  now()
);

-- Insérer un praticien de test
INSERT INTO "practitioners" ("id", "tenant_id", "first_name", "last_name", "specialty", "color") 
VALUES (
  'c47ac10b-58cc-4372-a567-0e02b2c3d482', 
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'Dr. Jean', 
  'Martin', 
  'Médecine Générale', 
  '#3498db'
); 