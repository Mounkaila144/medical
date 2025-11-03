"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddUserIdToPractitioners1703000000000 = void 0;
const typeorm_1 = require("typeorm");
class AddUserIdToPractitioners1703000000000 {
    async up(queryRunner) {
        await queryRunner.addColumn('practitioners', new typeorm_1.TableColumn({
            name: 'user_id',
            type: 'uuid',
            isNullable: true,
        }));
        await queryRunner.createForeignKey('practitioners', new typeorm_1.TableForeignKey({
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE',
        }));
        await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_practitioners_user_id" ON "practitioners" ("user_id") 
      WHERE "user_id" IS NOT NULL
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX "IDX_practitioners_user_id"`);
        const table = await queryRunner.getTable('practitioners');
        if (table) {
            const foreignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf('user_id') !== -1);
            if (foreignKey) {
                await queryRunner.dropForeignKey('practitioners', foreignKey);
            }
        }
        await queryRunner.dropColumn('practitioners', 'user_id');
    }
}
exports.AddUserIdToPractitioners1703000000000 = AddUserIdToPractitioners1703000000000;
//# sourceMappingURL=add-user-id-to-practitioners.migration.js.map