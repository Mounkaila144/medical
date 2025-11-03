import { InventoryService } from '../services/inventory.service';
export declare class InventoryController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    getItem(id: string): Promise<import("../entities/item.entity").Item>;
    getLowStockItems(): Promise<(import("../entities/item.entity").Item & {
        currentStock: number;
    })[]>;
    dispenseItem(payload: {
        itemId: string;
        quantity: number;
        reason: string;
    }): Promise<{
        success: boolean;
    }>;
    receiveItem(payload: {
        itemId: string;
        quantity: number;
        lotNumber: string;
        expiry: Date;
        supplierId: string;
    }): Promise<{
        success: boolean;
    }>;
}
