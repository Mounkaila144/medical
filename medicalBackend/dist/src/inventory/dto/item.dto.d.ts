import { ItemCategory, ItemUnit } from '../entities/item.entity';
export declare class CreateItemInput {
    sku: string;
    name: string;
    category: ItemCategory;
    unit: ItemUnit;
    reorderLevel: number;
}
export declare class UpdateItemInput {
    name?: string;
    category?: ItemCategory;
    unit?: ItemUnit;
    reorderLevel?: number;
}
