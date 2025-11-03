import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Item } from './entities/item.entity';
import { Lot } from './entities/lot.entity';
import { Movement } from './entities/movement.entity';
import { Supplier } from './entities/supplier.entity';
import { InventoryService } from './services/inventory.service';
import { SupplierService } from './services/supplier.service';
import { InventoryResolver } from './resolvers/inventory.resolver';
import { SupplierResolver } from './resolvers/supplier.resolver';
import { InventoryController } from './controllers/inventory.controller';
import { StockLowListener } from './events/stock-low.listener';

@Module({
  imports: [
    TypeOrmModule.forFeature([Item, Lot, Movement, Supplier]),
  ],
  controllers: [
    InventoryController,
  ],
  providers: [
    InventoryService,
    SupplierService,
    InventoryResolver,
    SupplierResolver,
    StockLowListener,
  ],
  exports: [
    InventoryService,
    SupplierService,
  ],
})
export class InventoryModule {}