import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { InventoryService } from '../services/inventory.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('items/:id')
  async getItem(@Param('id') id: string) {
    return this.inventoryService.findItemById(id);
  }

  @Get('items/low')
  async getLowStockItems() {
    return this.inventoryService.listLow();
  }

  @Post('dispense')
  async dispenseItem(
    @Body() payload: { itemId: string; quantity: number; reason: string },
  ) {
    await this.inventoryService.dispense(
      payload.itemId,
      payload.quantity,
      payload.reason,
    );
    return { success: true };
  }

  @Post('receive')
  async receiveItem(
    @Body()
    payload: {
      itemId: string;
      quantity: number;
      lotNumber: string;
      expiry: Date;
      supplierId: string;
    },
  ) {
    await this.inventoryService.receive(
      payload.itemId,
      payload.quantity,
      payload.lotNumber,
      payload.expiry,
      payload.supplierId,
    );
    return { success: true };
  }
} 