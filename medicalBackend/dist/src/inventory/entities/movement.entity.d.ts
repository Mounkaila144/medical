import { Item } from './item.entity';
export declare enum MovementType {
    IN = "IN",
    OUT = "OUT",
    ADJUST = "ADJUST"
}
export declare class Movement {
    id: string;
    item: Item;
    type: MovementType;
    qty: number;
    reason: string;
    reference: string;
    movedAt: Date;
}
