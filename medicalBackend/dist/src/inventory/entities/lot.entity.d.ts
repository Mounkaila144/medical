import { Item } from './item.entity';
export declare class Lot {
    id: string;
    item: Item;
    lotNumber: string;
    expiry: Date;
    quantity: number;
}
