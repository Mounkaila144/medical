import { Item } from '../entities/item.entity';

export class StockLowEvent {
  constructor(
    public readonly item: Partial<Item> & { id: string, name: string, sku: string, reorderLevel: number },
    public readonly currentStock: number,
  ) {}
} 