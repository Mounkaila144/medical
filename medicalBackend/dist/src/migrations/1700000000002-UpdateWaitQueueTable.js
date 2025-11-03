"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateWaitQueueTable1700000000002 = void 0;
const typeorm_1 = require("typeorm");
class UpdateWaitQueueTable1700000000002 {
    name = 'UpdateWaitQueueTable1700000000002';
    async up(queryRunner) {
        await queryRunner.addColumn('wait_queue_entries', new typeorm_1.TableColumn({
            name: 'practitioner_id',
            type: 'uuid',
            isNullable: true,
        }));
        await queryRunner.addColumn('wait_queue_entries', new typeorm_1.TableColumn({
            name: 'priority',
            type: 'enum',
            enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'],
            default: "'NORMAL'",
            isNullable: true,
        }));
        await queryRunner.addColumn('wait_queue_entries', new typeorm_1.TableColumn({
            name: 'reason',
            type: 'text',
            isNullable: true,
        }));
    }
    async down(queryRunner) {
        await queryRunner.dropColumn('wait_queue_entries', 'reason');
        await queryRunner.dropColumn('wait_queue_entries', 'priority');
        await queryRunner.dropColumn('wait_queue_entries', 'practitioner_id');
    }
}
exports.UpdateWaitQueueTable1700000000002 = UpdateWaitQueueTable1700000000002;
//# sourceMappingURL=1700000000002-UpdateWaitQueueTable.js.map