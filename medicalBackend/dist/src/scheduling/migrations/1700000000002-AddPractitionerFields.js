"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddPractitionerFields1700000000002 = void 0;
class AddPractitionerFields1700000000002 {
    name = 'AddPractitionerFields1700000000002';
    async up(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "practitioners" 
      ADD COLUMN "email" varchar,
      ADD COLUMN "phone_number" varchar,
      ADD COLUMN "slot_duration" integer DEFAULT 30
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "practitioners" 
      DROP COLUMN "email",
      DROP COLUMN "phone_number", 
      DROP COLUMN "slot_duration"
    `);
    }
}
exports.AddPractitionerFields1700000000002 = AddPractitionerFields1700000000002;
//# sourceMappingURL=1700000000002-AddPractitionerFields.js.map