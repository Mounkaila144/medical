import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { StockLowEvent } from './stock-low.event';

@Injectable()
export class StockLowListener {
  private readonly logger = new Logger(StockLowListener.name);

  @OnEvent('stock.low')
  handleStockLowEvent(event: StockLowEvent) {
    this.logger.warn(
      `ALERTE STOCK BAS: L'article "${event.item.name}" (SKU: ${event.item.sku}) est descendu à ${event.currentStock} unités, en dessous du niveau de réapprovisionnement de ${event.item.reorderLevel}.`
    );
    
    // Ici, on pourrait envoyer une notification par email, SMS, etc.
    // ou créer une tâche de réapprovisionnement automatique
  }
} 