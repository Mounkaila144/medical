import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class AddUserIdToPractitioners1703000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ajouter la colonne user_id
    await queryRunner.addColumn(
      'practitioners',
      new TableColumn({
        name: 'user_id',
        type: 'uuid',
        isNullable: true,
      }),
    );

    // Ajouter la contrainte de clé étrangère
    await queryRunner.createForeignKey(
      'practitioners',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );

    // Ajouter un index unique pour s'assurer qu'un utilisateur ne peut être lié qu'à un seul praticien
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_practitioners_user_id" ON "practitioners" ("user_id") 
      WHERE "user_id" IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Supprimer l'index
    await queryRunner.query(`DROP INDEX "IDX_practitioners_user_id"`);

    // Supprimer la contrainte de clé étrangère
    const table = await queryRunner.getTable('practitioners');
    if (table) {
      const foreignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf('user_id') !== -1);
      if (foreignKey) {
        await queryRunner.dropForeignKey('practitioners', foreignKey);
      }
    }

    // Supprimer la colonne
    await queryRunner.dropColumn('practitioners', 'user_id');
  }
} 