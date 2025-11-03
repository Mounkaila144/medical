import { Body, Controller, Get, Post, Patch, Delete, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';

import { WaitQueueService } from '../services/wait-queue.service';
import { WaitQueueEntry } from '../entities/wait-queue-entry.entity';
import { CreateWaitQueueEntryDto } from '../dto/create-wait-queue-entry.dto';
import { UpdateWaitQueueEntryDto } from '../dto/update-wait-queue-entry.dto';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@Controller('wait-queue')
@UseGuards(JwtAuthGuard, TenantGuard)
export class WaitQueueController {
  constructor(private readonly waitQueueService: WaitQueueService) {}

  @Post()
  async addToQueue(
    @TenantId() tenantId: string,
    @Body() createDto: CreateWaitQueueEntryDto,
  ): Promise<WaitQueueEntry> {
    return this.waitQueueService.enqueue(tenantId, createDto);
  }

  @Post('enqueue')
  async enqueue(
    @TenantId() tenantId: string,
    @Body() createDto: CreateWaitQueueEntryDto,
  ): Promise<WaitQueueEntry> {
    return this.waitQueueService.enqueue(tenantId, createDto);
  }

  @Post('call-next')
  async callNext(
    @TenantId() tenantId: string,
  ): Promise<WaitQueueEntry | null> {
    return this.waitQueueService.callNext(tenantId);
  }

  @Get()
  async getQueue(
    @TenantId() tenantId: string,
  ): Promise<WaitQueueEntry[]> {
    return this.waitQueueService.getQueue(tenantId);
  }

  @Get('currently-serving')
  async getCurrentlyServing(
    @TenantId() tenantId: string,
  ): Promise<WaitQueueEntry | null> {
    return this.waitQueueService.getCurrentlyServing(tenantId);
  }

  @Post(':id/mark-serving')
  async markAsServing(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) entryId: string,
  ): Promise<WaitQueueEntry> {
    return this.waitQueueService.markAsServing(tenantId, entryId);
  }

  @Post(':id/complete')
  async complete(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) entryId: string,
  ): Promise<void> {
    return this.waitQueueService.complete(tenantId, entryId);
  }

  @Patch(':id')
  async updateEntry(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) entryId: string,
    @Body() updateData: UpdateWaitQueueEntryDto,
  ): Promise<WaitQueueEntry> {
    return this.waitQueueService.updateEntry(tenantId, entryId, updateData);
  }

  @Delete(':id')
  async removeEntry(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) entryId: string,
  ): Promise<void> {
    return this.waitQueueService.removeEntry(tenantId, entryId);
  }
} 