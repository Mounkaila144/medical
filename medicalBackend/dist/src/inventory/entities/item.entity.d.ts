import { Tenant } from '../../auth/entities/tenant.entity';
import { Lot } from './lot.entity';
import { Movement } from './movement.entity';
export declare enum ItemCategory {
    DRUG = "DRUG",
    CONSUMABLE = "CONSUMABLE"
}
export declare enum ItemUnit {
    BOX = "BOX",
    PIECE = "PIECE",
    ML = "ML"
}
export declare class Item {
    id: string;
    tenant: Tenant;
    sku: string;
    name: string;
    category: ItemCategory;
    unit: ItemUnit;
    reorderLevel: number;
    lots: Lot[];
    movements: Movement[];
}
