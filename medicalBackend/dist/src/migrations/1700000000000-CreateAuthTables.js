"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAuthTables1700000000000 = void 0;
class CreateAuthTables1700000000000 {
    name = 'CreateAuthTables1700000000000';
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE "tenants" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(255) NOT NULL,
        "slug" character varying(255) NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_tenants_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_tenants" PRIMARY KEY ("id")
      )
    `);
        await queryRunner.query(`
      CREATE TYPE "public"."users_role_enum" AS ENUM('SUPERADMIN', 'CLINIC_ADMIN', 'EMPLOYEE')
    `);
        await queryRunner.query(`
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
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "sessions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "refreshTokenHash" character varying(255) NOT NULL,
        "expiresAt" TIMESTAMP NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_sessions" PRIMARY KEY ("id")
      )
    `);
        await queryRunner.query(`
      ALTER TABLE "users" 
      ADD CONSTRAINT "FK_users_tenants" 
      FOREIGN KEY ("tenantId") 
      REFERENCES "tenants"("id") 
      ON DELETE SET NULL 
      ON UPDATE NO ACTION
    `);
        await queryRunner.query(`
      ALTER TABLE "sessions" 
      ADD CONSTRAINT "FK_sessions_users" 
      FOREIGN KEY ("userId") 
      REFERENCES "users"("id") 
      ON DELETE CASCADE 
      ON UPDATE NO ACTION
    `);
        await queryRunner.query(`CREATE INDEX "IDX_users_email" ON "users" ("email") `);
        await queryRunner.query(`CREATE INDEX "IDX_users_tenantId" ON "users" ("tenantId") `);
        await queryRunner.query(`CREATE INDEX "IDX_sessions_userId" ON "sessions" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_sessions_expiresAt" ON "sessions" ("expiresAt") `);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT "FK_sessions_users"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_users_tenants"`);
        await queryRunner.query(`DROP INDEX "IDX_sessions_expiresAt"`);
        await queryRunner.query(`DROP INDEX "IDX_sessions_userId"`);
        await queryRunner.query(`DROP INDEX "IDX_users_tenantId"`);
        await queryRunner.query(`DROP INDEX "IDX_users_email"`);
        await queryRunner.query(`DROP TABLE "sessions"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP TABLE "tenants"`);
    }
}
exports.CreateAuthTables1700000000000 = CreateAuthTables1700000000000;
//# sourceMappingURL=1700000000000-CreateAuthTables.js.map