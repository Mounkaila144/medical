import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UpdateWaitQueueTable1700000000002 implements MigrationInterface {
  name = 'UpdateWaitQueueTable1700000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add practitioner_id column
    await queryRunner.addColumn(
      'wait_queue_entries',
      new TableColumn({
        name: 'practitioner_id',
        type: 'uuid',
        isNullable: true,
      }),
    );

    // Add priority column
    await queryRunner.addColumn(
      'wait_queue_entries',
      new TableColumn({
        name: 'priority',
        type: 'enum',
        enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'],
        default: "'NORMAL'",
        isNullable: true,
      }),
    );

    // Add reason column
    await queryRunner.addColumn(
      'wait_queue_entries',
      new TableColumn({
        name: 'reason',
        type: 'text',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the added columns
    await queryRunner.dropColumn('wait_queue_entries', 'reason');
    await queryRunner.dropColumn('wait_queue_entries', 'priority');
    await queryRunner.dropColumn('wait_queue_entries', 'practitioner_id');
  }
} 