import { Controller, Get, Patch, Delete, Param, Body, ParseUUIDPipe } from '@nestjs/common';
import { WaitQueueService } from '../services/wait-queue.service';
import { UpdateWaitQueueEntryDto } from '../dto/update-wait-queue-entry.dto';

@Controller('wait-queue-test')
export class WaitQueueTestController {
  constructor(private readonly waitQueueService: WaitQueueService) {}

  @Get()
  test() {
    return { message: 'Wait queue test endpoint works!' };
  }

  @Patch(':id')
  async testUpdate(
    @Param('id', ParseUUIDPipe) entryId: string,
    @Body() updateData: UpdateWaitQueueEntryDto,
  ) {
    // Utiliser un tenantId de test
    const testTenantId = '00000000-0000-0000-0000-000000000000';
    try {
      const result = await this.waitQueueService.updateEntry(testTenantId, entryId, updateData);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message, type: error.constructor.name };
    }
  }

  @Delete(':id')
  async testDelete(
    @Param('id', ParseUUIDPipe) entryId: string,
  ) {
    // Utiliser un tenantId de test
    const testTenantId = '00000000-0000-0000-0000-000000000000';
    try {
      await this.waitQueueService.removeEntry(testTenantId, entryId);
      return { success: true, message: 'Entry deleted successfully' };
    } catch (error) {
      return { success: false, error: error.message, type: error.constructor.name };
    }
  }
}