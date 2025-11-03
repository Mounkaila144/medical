import { Item } from '../entities/item.entity';
export declare class StockLowEvent {
    readonly item: Partial<Item> & {
        id: string;
        name: string;
        sku: string;
        reorderLevel: number;
    };
    readonly currentStock: number;
    constructor(item: Partial<Item> & {
        id: string;
        name: string;
        sku: string;
        reorderLevel: number;
    }, currentStock: number);
}
