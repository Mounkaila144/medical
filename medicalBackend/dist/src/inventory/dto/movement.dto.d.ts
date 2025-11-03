export declare class ReceiveItemInput {
    itemId: string;
    lotNumber: string;
    expiry: Date;
    quantity: number;
    reference?: string;
}
export declare class DispenseItemInput {
    itemId: string;
    quantity: number;
    reason: string;
    reference?: string;
}
export declare class AdjustItemInput {
    itemId: string;
    lotId: string;
    newQuantity: number;
    reason: string;
}
