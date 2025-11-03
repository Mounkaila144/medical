import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { WaitQueueService } from '../services/wait-queue.service';
import { WaitQueueEntry } from '../entities/wait-queue-entry.entity';
import { Priority } from '../entities/wait-queue-entry.entity';
import { Public } from '../../common/decorators/public.decorator';

interface TakeNumberDto {
  reason?: string;
  priority?: Priority;
}

/**
 * Contrôleur PUBLIC pour la file d'attente
 * Accès SANS authentification pour les bornes de prise de numéro et écrans d'affichage
 */
@Controller('public/wait-queue')
@Public()
export class PublicWaitQueueController {
  constructor(private readonly waitQueueService: WaitQueueService) {}

  /**
   * Prendre un numéro (PUBLIC - sans auth)
   * Usage: POST /public/wait-queue
   */
  @Post()
  async takeNumber(
    @Body() data: TakeNumberDto,
    @Query('tenant') tenantId?: string,
  ): Promise<WaitQueueEntry> {
    // Utiliser le tenant fourni ou celui par défaut
    const tenant = tenantId || process.env.DEFAULT_TENANT_ID || '';

    if (!tenant) {
      throw new Error('Tenant ID is required. Please provide ?tenant=xxx or set DEFAULT_TENANT_ID env variable');
    }

    return this.waitQueueService.enqueue(tenant, {
      patientId: undefined, // Patient anonyme
      practitionerId: undefined,
      priority: data.priority || Priority.NORMAL,
      reason: data.reason || 'Consultation',
    });
  }

  /**
   * Obtenir la file d'attente actuelle (PUBLIC - sans auth)
   * Usage: GET /public/wait-queue?tenant=xxx
   */
  @Get()
  async getQueue(
    @Query('tenant') tenantId?: string,
  ): Promise<WaitQueueEntry[]> {
    const tenant = tenantId || process.env.DEFAULT_TENANT_ID || '';

    if (!tenant) {
      throw new Error('Tenant ID is required. Please provide ?tenant=xxx or set DEFAULT_TENANT_ID env variable');
    }

    return this.waitQueueService.getQueue(tenant);
  }

  /**
   * Obtenir le ticket actuellement servi (PUBLIC - sans auth)
   * Usage: GET /public/wait-queue/currently-serving?tenant=xxx
   */
  @Get('currently-serving')
  async getCurrentlyServing(
    @Query('tenant') tenantId?: string,
  ): Promise<WaitQueueEntry | null> {
    const tenant = tenantId || process.env.DEFAULT_TENANT_ID || '';

    if (!tenant) {
      throw new Error('Tenant ID is required. Please provide ?tenant=xxx or set DEFAULT_TENANT_ID env variable');
    }

    return this.waitQueueService.getCurrentlyServing(tenant);
  }
}
