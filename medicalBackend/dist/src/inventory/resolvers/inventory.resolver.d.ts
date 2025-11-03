import { User } from '../../auth/entities/user.entity';
import { InventoryService } from '../services/inventory.service';
import { Item } from '../entities/item.entity';
import { Movement } from '../entities/movement.entity';
import { ReceiveItemInput, DispenseItemInput, AdjustItemInput } from '../dto/movement.dto';
export declare class InventoryResolver {
    private inventoryService;
    constructor(inventoryService: InventoryService);
    lowStockItems(user: User): Promise<(Item & {
        currentStock: number;
    })[]>;
    receiveItem(input: ReceiveItemInput, user: User): Promise<Movement>;
    dispenseItem(input: DispenseItemInput, user: User): Promise<Movement>;
    adjustItem(input: AdjustItemInput, user: User): Promise<Movement>;
}
